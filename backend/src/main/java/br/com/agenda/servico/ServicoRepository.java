package br.com.agenda.servico;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findByProfissionalIdOrderByNome(Long profissionalId);

    List<Servico> findByProfissionalIdAndAtivoTrueOrderByNome(Long profissionalId);
}
