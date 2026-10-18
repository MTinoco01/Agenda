package br.com.agenda.disponibilidade;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Long> {

    List<Disponibilidade> findByProfissionalIdOrderByDiaSemanaAscHoraInicioAsc(Long profissionalId);

    List<Disponibilidade> findByProfissionalIdAndDiaSemanaOrderByHoraInicio(Long profissionalId, DayOfWeek diaSemana);

    void deleteByProfissionalId(Long profissionalId);
}
