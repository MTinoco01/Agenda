package br.com.agenda.agendamento;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.agenda.agendamento.AgendamentoDtos.AgendamentoResponse;
import br.com.agenda.agendamento.AgendamentoDtos.NovoAgendamentoRequest;
import br.com.agenda.agendamento.CalculadoraDeHorarios.Janela;
import br.com.agenda.agendamento.CalculadoraDeHorarios.Ocupado;
import br.com.agenda.common.ConflitoException;
import br.com.agenda.common.NaoEncontradoException;
import br.com.agenda.common.RegraNegocioException;
import br.com.agenda.config.AppProperties;
import br.com.agenda.disponibilidade.DisponibilidadeRepository;
import br.com.agenda.servico.Servico;
import br.com.agenda.servico.ServicoRepository;
import br.com.agenda.usuario.Usuario;
import br.com.agenda.usuario.UsuarioRepository;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentos;
    private final ServicoRepository servicos;
    private final DisponibilidadeRepository disponibilidades;
    private final UsuarioRepository usuarios;
    private final Duration intervalo;
    private final Clock clock;

    public AgendamentoService(AgendamentoRepository agendamentos, ServicoRepository servicos,
                              DisponibilidadeRepository disponibilidades, UsuarioRepository usuarios,
                              AppProperties props, Clock clock) {
        this.agendamentos = agendamentos;
        this.servicos = servicos;
        this.disponibilidades = disponibilidades;
        this.usuarios = usuarios;
        this.intervalo = Duration.ofMinutes(props.agenda().intervaloMinutos());
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> horariosLivres(Long profissionalId, Long servicoId, LocalDate data) {
        Servico servico = servicoAtivoDoProfissional(profissionalId, servicoId);
        List<Ocupado> ocupados = agendamentos
                .findAtivosNoIntervalo(profissionalId, data.atStartOfDay(), data.plusDays(1).atStartOfDay())
                .stream().map(a -> new Ocupado(a.getInicio(), a.getFim())).toList();
        return CalculadoraDeHorarios.horariosLivres(data, janelasDoDia(profissionalId, data), ocupados,
                Duration.ofMinutes(servico.getDuracaoMinutos()), intervalo, LocalDateTime.now(clock));
    }

    @Transactional
    public AgendamentoResponse agendar(Long clienteId, NovoAgendamentoRequest req) {
        Servico servico = servicos.findById(req.servicoId())
                .filter(Servico::isAtivo)
                .orElseThrow(() -> new NaoEncontradoException("Servico nao encontrado"));
        Long profissionalId = servico.getProfissional().getId();
        if (profissionalId.equals(clienteId)) {
            throw new RegraNegocioException("Voce nao pode agendar um servico consigo mesmo");
        }

        LocalDateTime inicio = req.inicio().withSecond(0).withNano(0);
        LocalDateTime fim = inicio.plusMinutes(servico.getDuracaoMinutos());
        if (!inicio.isAfter(LocalDateTime.now(clock))) {
            throw new RegraNegocioException("O horario precisa ser no futuro");
        }
        if (!CalculadoraDeHorarios.dentroDeAlgumaJanela(inicio, fim, janelasDoDia(profissionalId, inicio.toLocalDate()))) {
            throw new RegraNegocioException("Horario fora da disponibilidade do profissional");
        }
        // Checagem amigavel; a constraint EXCLUDE do banco cobre a corrida entre duas requisicoes
        if (!agendamentos.findAtivosNoIntervalo(profissionalId, inicio, fim).isEmpty()) {
            throw new ConflitoException("Horario ja ocupado");
        }

        Usuario cliente = usuarios.getReferenceById(clienteId);
        Agendamento agendamento = agendamentos.saveAndFlush(new Agendamento(cliente, servico, inicio));
        return AgendamentoResponse.de(agendamento);
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> doUsuario(Long usuarioId) {
        return agendamentos.findDoUsuario(usuarioId).stream().map(AgendamentoResponse::de).toList();
    }

    @Transactional
    public AgendamentoResponse cancelar(Long usuarioId, Long agendamentoId) {
        Agendamento agendamento = doUsuarioOuErro(usuarioId, agendamentoId);
        agendamento.cancelar();
        return AgendamentoResponse.de(agendamento);
    }

    @Transactional
    public AgendamentoResponse concluir(Long profissionalId, Long agendamentoId) {
        Agendamento agendamento = doUsuarioOuErro(profissionalId, agendamentoId);
        if (!agendamento.getProfissional().getId().equals(profissionalId)) {
            throw new RegraNegocioException("Apenas o profissional pode concluir o atendimento");
        }
        agendamento.concluir();
        return AgendamentoResponse.de(agendamento);
    }

    private Agendamento doUsuarioOuErro(Long usuarioId, Long agendamentoId) {
        // Retorna 404 tambem quando o agendamento e de outra pessoa, para nao vazar que ele existe
        return agendamentos.findById(agendamentoId)
                .filter(a -> a.envolve(usuarioId))
                .orElseThrow(() -> new NaoEncontradoException("Agendamento nao encontrado"));
    }

    private Servico servicoAtivoDoProfissional(Long profissionalId, Long servicoId) {
        return servicos.findById(servicoId)
                .filter(s -> s.isAtivo() && s.pertenceA(profissionalId))
                .orElseThrow(() -> new NaoEncontradoException("Servico nao encontrado"));
    }

    private List<Janela> janelasDoDia(Long profissionalId, LocalDate data) {
        return disponibilidades.findByProfissionalIdAndDiaSemanaOrderByHoraInicio(profissionalId, data.getDayOfWeek())
                .stream().map(d -> new Janela(d.getHoraInicio(), d.getHoraFim())).toList();
    }
}
