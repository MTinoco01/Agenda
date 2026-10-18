package br.com.agenda.disponibilidade;

import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.agenda.common.RegraNegocioException;
import br.com.agenda.disponibilidade.DisponibilidadeDtos.JanelaRequest;
import br.com.agenda.disponibilidade.DisponibilidadeDtos.JanelaResponse;
import br.com.agenda.usuario.Usuario;
import br.com.agenda.usuario.UsuarioRepository;

@Service
public class DisponibilidadeService {

    private final DisponibilidadeRepository disponibilidades;
    private final UsuarioRepository usuarios;

    public DisponibilidadeService(DisponibilidadeRepository disponibilidades, UsuarioRepository usuarios) {
        this.disponibilidades = disponibilidades;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<JanelaResponse> listar(Long profissionalId) {
        return disponibilidades.findByProfissionalIdOrderByDiaSemanaAscHoraInicioAsc(profissionalId).stream()
                .map(JanelaResponse::de).toList();
    }

    /** Substitui toda a grade semanal do profissional pela informada. */
    @Transactional
    public List<JanelaResponse> substituir(Long profissionalId, List<JanelaRequest> janelas) {
        validar(janelas);
        disponibilidades.deleteByProfissionalId(profissionalId);
        disponibilidades.flush();
        Usuario profissional = usuarios.getReferenceById(profissionalId);
        janelas.forEach(j -> disponibilidades.save(
                new Disponibilidade(profissional, j.diaSemana(), j.horaInicio(), j.horaFim())));
        return listar(profissionalId);
    }

    private void validar(List<JanelaRequest> janelas) {
        for (JanelaRequest j : janelas) {
            if (!j.horaFim().isAfter(j.horaInicio())) {
                throw new RegraNegocioException("Hora final deve ser depois da inicial (" + j.diaSemana() + ")");
            }
        }
        Map<DayOfWeek, List<JanelaRequest>> porDia = janelas.stream()
                .collect(Collectors.groupingBy(JanelaRequest::diaSemana));
        porDia.forEach((dia, lista) -> {
            List<JanelaRequest> ordenadas = lista.stream()
                    .sorted(Comparator.comparing(JanelaRequest::horaInicio)).toList();
            for (int i = 1; i < ordenadas.size(); i++) {
                if (ordenadas.get(i).horaInicio().isBefore(ordenadas.get(i - 1).horaFim())) {
                    throw new RegraNegocioException("Janelas sobrepostas em " + dia);
                }
            }
        });
    }
}
