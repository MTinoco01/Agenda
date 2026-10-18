package br.com.agenda.agendamento;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.agenda.agendamento.AgendamentoDtos.AgendamentoResponse;
import br.com.agenda.agendamento.AgendamentoDtos.NovoAgendamentoRequest;
import br.com.agenda.common.UsuarioLogado;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENTE')")
    public AgendamentoResponse agendar(@AuthenticationPrincipal Jwt jwt,
                                       @RequestBody @Valid NovoAgendamentoRequest req) {
        return agendamentoService.agendar(UsuarioLogado.id(jwt), req);
    }

    /** Cliente ve os que marcou; profissional ve os que recebeu. */
    @GetMapping("/meus")
    public List<AgendamentoResponse> meus(@AuthenticationPrincipal Jwt jwt) {
        return agendamentoService.doUsuario(UsuarioLogado.id(jwt));
    }

    @PatchMapping("/{id}/cancelar")
    public AgendamentoResponse cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return agendamentoService.cancelar(UsuarioLogado.id(jwt), id);
    }

    @PatchMapping("/{id}/concluir")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public AgendamentoResponse concluir(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return agendamentoService.concluir(UsuarioLogado.id(jwt), id);
    }
}
