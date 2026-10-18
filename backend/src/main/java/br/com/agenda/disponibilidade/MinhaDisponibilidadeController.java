package br.com.agenda.disponibilidade;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.agenda.common.UsuarioLogado;
import br.com.agenda.disponibilidade.DisponibilidadeDtos.JanelaRequest;
import br.com.agenda.disponibilidade.DisponibilidadeDtos.JanelaResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/me/disponibilidades")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class MinhaDisponibilidadeController {

    private final DisponibilidadeService disponibilidadeService;

    public MinhaDisponibilidadeController(DisponibilidadeService disponibilidadeService) {
        this.disponibilidadeService = disponibilidadeService;
    }

    @GetMapping
    public List<JanelaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return disponibilidadeService.listar(UsuarioLogado.id(jwt));
    }

    @PutMapping
    public List<JanelaResponse> substituir(@AuthenticationPrincipal Jwt jwt,
                                           @RequestBody List<@Valid JanelaRequest> janelas) {
        return disponibilidadeService.substituir(UsuarioLogado.id(jwt), janelas);
    }
}
