package br.com.agenda.auth;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.agenda.auth.AuthDtos.LoginRequest;
import br.com.agenda.auth.AuthDtos.RegistroRequest;
import br.com.agenda.auth.AuthDtos.TokenResponse;
import br.com.agenda.auth.AuthDtos.UsuarioResponse;
import br.com.agenda.common.ConflitoException;
import br.com.agenda.common.RegraNegocioException;
import br.com.agenda.usuario.Role;
import br.com.agenda.usuario.Usuario;
import br.com.agenda.usuario.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public TokenResponse registrar(RegistroRequest req) {
        if (req.role() == Role.ADMIN) {
            throw new RegraNegocioException("Nao e possivel se cadastrar como ADMIN");
        }
        String email = req.email().trim().toLowerCase();
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("E-mail ja cadastrado");
        }
        Usuario usuario = usuarios.save(
                new Usuario(req.nome().trim(), email, passwordEncoder.encode(req.senha()), req.role()));
        return respostaCom(usuario);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest req) {
        Usuario usuario = usuarios.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenhaHash()))
                .orElseThrow(() -> new BadCredentialsException("Credenciais invalidas"));
        return respostaCom(usuario);
    }

    private TokenResponse respostaCom(Usuario usuario) {
        return new TokenResponse(tokenService.gerar(usuario), tokenService.getExpiracaoSegundos(),
                new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getRole()));
    }
}
