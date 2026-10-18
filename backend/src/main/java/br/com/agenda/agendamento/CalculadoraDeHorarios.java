package br.com.agenda.agendamento;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Logica pura (sem banco) que calcula os horarios livres de um dia.
 * Fica isolada para ser facil de testar com testes unitarios.
 */
public final class CalculadoraDeHorarios {

    public record Janela(LocalTime inicio, LocalTime fim) {
    }

    public record Ocupado(LocalDateTime inicio, LocalDateTime fim) {
    }

    private CalculadoraDeHorarios() {
    }

    /**
     * @param data      dia consultado
     * @param janelas   janelas de atendimento do profissional nesse dia da semana
     * @param ocupados  agendamentos ativos que tocam esse dia
     * @param duracao   duracao do servico escolhido
     * @param intervalo passo entre um horario oferecido e o proximo
     * @param agora     instante atual (horarios passados nao sao oferecidos)
     */
    public static List<LocalDateTime> horariosLivres(LocalDate data, List<Janela> janelas, List<Ocupado> ocupados,
                                                     Duration duracao, Duration intervalo, LocalDateTime agora) {
        List<LocalDateTime> livres = new ArrayList<>();
        for (Janela janela : janelas) {
            LocalDateTime fimJanela = data.atTime(janela.fim());
            for (LocalDateTime inicio = data.atTime(janela.inicio());
                 !inicio.plus(duracao).isAfter(fimJanela);
                 inicio = inicio.plus(intervalo)) {
                LocalDateTime fim = inicio.plus(duracao);
                if (inicio.isAfter(agora) && !conflita(inicio, fim, ocupados)) {
                    livres.add(inicio);
                }
            }
        }
        livres.sort(null);
        return livres;
    }

    /** Verifica se [inicio, fim) cabe inteiro em alguma janela. */
    public static boolean dentroDeAlgumaJanela(LocalDateTime inicio, LocalDateTime fim, List<Janela> janelas) {
        if (!inicio.toLocalDate().equals(fim.toLocalDate())) {
            return false;
        }
        LocalTime i = inicio.toLocalTime();
        LocalTime f = fim.toLocalTime();
        return janelas.stream().anyMatch(j -> !i.isBefore(j.inicio()) && !f.isAfter(j.fim()));
    }

    private static boolean conflita(LocalDateTime inicio, LocalDateTime fim, List<Ocupado> ocupados) {
        return ocupados.stream().anyMatch(o -> inicio.isBefore(o.fim()) && fim.isAfter(o.inicio()));
    }
}
