package br.com.agenda.profissional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.agenda.agendamento.AgendamentoService;
import br.com.agenda.disponibilidade.DisponibilidadeDtos.JanelaResponse;
import br.com.agenda.disponibilidade.DisponibilidadeService;
import br.com.agenda.servico.ServicoDtos.ServicoResponse;
import br.com.agenda.servico.ServicoService;
import br.com.agenda.usuario.Role;
import br.com.agenda.usuario.UsuarioRepository;

/** Endpoints publicos usados pelo cliente para escolher profissional, servico e horario. */
@RestController
@RequestMapping("/api/profissionais")
public class ProfissionalController {

    public record ProfissionalResponse(Long id, String nome) {
    }

    private final UsuarioRepository usuarios;
    private final ServicoService servicoService;
    private final DisponibilidadeService disponibilidadeService;
    private final AgendamentoService agendamentoService;

    public ProfissionalController(UsuarioRepository usuarios, ServicoService servicoService,
                                  DisponibilidadeService disponibilidadeService,
                                  AgendamentoService agendamentoService) {
        this.usuarios = usuarios;
        this.servicoService = servicoService;
        this.disponibilidadeService = disponibilidadeService;
        this.agendamentoService = agendamentoService;
    }

    @GetMapping
    public List<ProfissionalResponse> listar() {
        return usuarios.findByRoleOrderByNome(Role.PROFISSIONAL).stream()
                .map(u -> new ProfissionalResponse(u.getId(), u.getNome())).toList();
    }

    @GetMapping("/{id}/servicos")
    public List<ServicoResponse> servicos(@PathVariable Long id) {
        return servicoService.listarAtivos(id);
    }

    @GetMapping("/{id}/disponibilidades")
    public List<JanelaResponse> disponibilidades(@PathVariable Long id) {
        return disponibilidadeService.listar(id);
    }

    // Ex.: GET /api/profissionais/1/horarios-livres?servicoId=2&data=2026-10-20
    @GetMapping("/{id}/horarios-livres")
    public List<LocalDateTime> horariosLivres(@PathVariable Long id, @RequestParam Long servicoId,
                                              @RequestParam LocalDate data) {
        return agendamentoService.horariosLivres(id, servicoId, data);
    }
}
