package br.com.agenda.agendamento;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /** Agendamentos ativos do profissional que se sobrepoem ao intervalo [inicio, fim). */
    @Query("""
            select a from Agendamento a
            where a.profissional.id = :profissionalId
              and a.status <> br.com.agenda.agendamento.StatusAgendamento.CANCELADO
              and a.inicio < :fim
              and a.fim > :inicio
            order by a.inicio
            """)
    List<Agendamento> findAtivosNoIntervalo(@Param("profissionalId") Long profissionalId,
                                           @Param("inicio") LocalDateTime inicio,
                                           @Param("fim") LocalDateTime fim);

    @Query("""
            select a from Agendamento a
            join fetch a.servico join fetch a.cliente join fetch a.profissional
            where a.cliente.id = :usuarioId or a.profissional.id = :usuarioId
            order by a.inicio desc
            """)
    List<Agendamento> findDoUsuario(@Param("usuarioId") Long usuarioId);
}
