package br.com.agenda.common;

/** Recurso inexistente ou que o usuario nao pode ver (responde 404). */
public class NaoEncontradoException extends RuntimeException {

    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
