package br.com.agenda.common;

import org.springframework.security.oauth2.jwt.Jwt;

/** Extrai o id do usuario a partir do subject do token. */
public final class UsuarioLogado {

    private UsuarioLogado() {
    }

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
