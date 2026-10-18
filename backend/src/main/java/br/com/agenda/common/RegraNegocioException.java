package br.com.agenda.common;

/** Violacao de regra de negocio (responde 422). */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
