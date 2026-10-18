package br.com.agenda.agendamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

public final class AgendamentoDtos {

    private AgendamentoDtos() {
    }

    public record NovoAgendamentoRequest(
            @NotNull Long servicoId,
            @NotNull @Future LocalDateTime inicio) {
    }

    public record AgendamentoResponse(
            Long id,
            LocalDateTime inicio,
            LocalDateTime fim,
            StatusAgendamento status,
            Long servicoId,
            String servico,
            BigDecimal preco,
            Long clienteId,
            String cliente,
            Long profissionalId,
            String profissional) {

        public static AgendamentoResponse de(Agendamento a) {
            return new AgendamentoResponse(a.getId(), a.getInicio(), a.getFim(), a.getStatus(),
                    a.getServico().getId(), a.getServico().getNome(), a.getServico().getPreco(),
                    a.getCliente().getId(), a.getCliente().getNome(),
                    a.getProfissional().getId(), a.getProfissional().getNome());
        }
    }
}
