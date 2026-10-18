package br.com.agenda.servico;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.agenda.common.UsuarioLogado;
import br.com.agenda.servico.ServicoDtos.ServicoRequest;
import br.com.agenda.servico.ServicoDtos.ServicoResponse;
import jakarta.validation.Valid;

/** Gestao dos servicos oferecidos pelo profissional logado. */
@RestController
@RequestMapping("/api/me/servicos")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class MeusServicosController {

    private final ServicoService servicoService;

    public MeusServicosController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public List<ServicoResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return servicoService.listarDoProfissional(UsuarioLogado.id(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServicoResponse criar(@AuthenticationPrincipal Jwt jwt, @RequestBody @Valid ServicoRequest req) {
        return servicoService.criar(UsuarioLogado.id(jwt), req);
    }

    @PutMapping("/{id}")
    public ServicoResponse atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                     @RequestBody @Valid ServicoRequest req) {
        return servicoService.atualizar(UsuarioLogado.id(jwt), id, req);
    }
}
