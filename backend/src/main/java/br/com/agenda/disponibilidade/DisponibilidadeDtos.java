package br.com.agenda.disponibilidade;

import java.time.DayOfWeek;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public final class DisponibilidadeDtos {

    private DisponibilidadeDtos() {
    }

    public record JanelaRequest(
            @NotNull DayOfWeek diaSemana,
            @NotNull LocalTime horaInicio,
            @NotNull LocalTime horaFim) {
    }

    public record JanelaResponse(Long id, DayOfWeek diaSemana, LocalTime horaInicio, LocalTime horaFim) {

        public static JanelaResponse de(Disponibilidade d) {
            return new JanelaResponse(d.getId(), d.getDiaSemana(), d.getHoraInicio(), d.getHoraFim());
        }
    }
}
