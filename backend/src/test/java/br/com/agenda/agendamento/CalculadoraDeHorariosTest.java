package br.com.agenda.agendamento;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.agenda.agendamento.CalculadoraDeHorarios.Janela;
import br.com.agenda.agendamento.CalculadoraDeHorarios.Ocupado;

class CalculadoraDeHorariosTest {

    private static final LocalDate DIA = LocalDate.of(2030, 1, 7);
    private static final LocalDateTime ONTEM = DIA.minusDays(1).atStartOfDay();
    private static final Duration MEIA_HORA = Duration.ofMinutes(30);

    private static LocalDateTime as(int hora, int minuto) {
        return DIA.atTime(hora, minuto);
    }

    @Test
    void ofereceHorariosQueCabemInteirosNaJanela() {
        List<Janela> janelas = List.of(new Janela(LocalTime.of(9, 0), LocalTime.of(11, 0)));

        List<LocalDateTime> livres = CalculadoraDeHorarios.horariosLivres(
                DIA, janelas, List.of(), Duration.ofMinutes(60), MEIA_HORA, ONTEM);

        // 10:30 nao entra: terminaria 11:30, depois do fim da janela
        assertThat(livres).containsExactly(as(9, 0), as(9, 30), as(10, 0));
    }

    @Test
    void removeHorariosQueConflitamComAgendamentos() {
        List<Janela> janelas = List.of(new Janela(LocalTime.of(9, 0), LocalTime.of(11, 0)));
        List<Ocupado> ocupados = List.of(new Ocupado(as(9, 30), as(10, 0)));

        List<LocalDateTime> livres = CalculadoraDeHorarios.horariosLivres(
                DIA, janelas, ocupados, MEIA_HORA, MEIA_HORA, ONTEM);

        assertThat(livres).containsExactly(as(9, 0), as(10, 0), as(10, 30));
    }

    @Test
    void naoOfereceHorariosNoPassado() {
        List<Janela> janelas = List.of(new Janela(LocalTime.of(9, 0), LocalTime.of(11, 0)));

        List<LocalDateTime> livres = CalculadoraDeHorarios.horariosLivres(
                DIA, janelas, List.of(), MEIA_HORA, MEIA_HORA, as(9, 45));

        assertThat(livres).containsExactly(as(10, 0), as(10, 30));
    }

    @Test
    void juntaVariasJanelasEmOrdem() {
        List<Janela> janelas = List.of(
                new Janela(LocalTime.of(14, 0), LocalTime.of(15, 0)),
                new Janela(LocalTime.of(9, 0), LocalTime.of(10, 0)));

        List<LocalDateTime> livres = CalculadoraDeHorarios.horariosLivres(
                DIA, janelas, List.of(), MEIA_HORA, MEIA_HORA, ONTEM);

        assertThat(livres).containsExactly(as(9, 0), as(9, 30), as(14, 0), as(14, 30));
    }

    @Test
    void validaSeIntervaloCabeEmAlgumaJanela() {
        List<Janela> janelas = List.of(new Janela(LocalTime.of(9, 0), LocalTime.of(12, 0)));

        assertThat(CalculadoraDeHorarios.dentroDeAlgumaJanela(as(11, 0), as(12, 0), janelas)).isTrue();
        assertThat(CalculadoraDeHorarios.dentroDeAlgumaJanela(as(11, 30), as(12, 30), janelas)).isFalse();
        assertThat(CalculadoraDeHorarios.dentroDeAlgumaJanela(as(8, 30), as(9, 30), janelas)).isFalse();
    }
}
