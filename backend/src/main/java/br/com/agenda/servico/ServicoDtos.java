package br.com.agenda.servico;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ServicoDtos {

    private ServicoDtos() {
    }

    public record ServicoRequest(
            @NotBlank @Size(max = 120) String nome,
            @Min(5) @Max(480) int duracaoMinutos,
            @NotNull @DecimalMin("0.00") BigDecimal preco,
            Boolean ativo) {
    }

    public record ServicoResponse(Long id, String nome, int duracaoMinutos, BigDecimal preco, boolean ativo) {

        public static ServicoResponse de(Servico s) {
            return new ServicoResponse(s.getId(), s.getNome(), s.getDuracaoMinutos(), s.getPreco(), s.isAtivo());
        }
    }
}
