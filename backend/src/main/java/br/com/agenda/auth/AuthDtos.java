package br.com.agenda.auth;

import br.com.agenda.usuario.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegistroRequest(
            @NotBlank @Size(max = 120) String nome,
            @NotBlank @Email @Size(max = 160) String email,
            @NotBlank @Size(min = 8, max = 72) String senha,
            // Apenas CLIENTE ou PROFISSIONAL podem se cadastrar sozinhos
            @NotNull Role role) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String senha) {
    }

    public record TokenResponse(String token, long expiraEmSegundos, UsuarioResponse usuario) {
    }

    public record UsuarioResponse(Long id, String nome, String email, Role role) {
    }
}
