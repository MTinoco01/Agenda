package br.com.agenda.common;

/** Estado conflitante, como horario ja ocupado ou e-mail ja cadastrado (responde 409). */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
