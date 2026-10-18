package br.com.agenda.agendamento;

import java.time.LocalDateTime;

import br.com.agenda.common.RegraNegocioException;
import br.com.agenda.servico.Servico;
import br.com.agenda.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "agendamento")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id")
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profissional_id")
    private Usuario profissional;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Column(nullable = false)
    private LocalDateTime inicio;

    @Column(nullable = false)
    private LocalDateTime fim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAgendamento status = StatusAgendamento.AGENDADO;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    // Lock otimista: impede que duas alteracoes concorrentes se sobrescrevam
    @Version
    private Long version;

    protected Agendamento() {
    }

    public Agendamento(Usuario cliente, Servico servico, LocalDateTime inicio) {
        this.cliente = cliente;
        this.servico = servico;
        this.profissional = servico.getProfissional();
        this.inicio = inicio;
        this.fim = inicio.plusMinutes(servico.getDuracaoMinutos());
    }

    public void cancelar() {
        if (status != StatusAgendamento.AGENDADO) {
            throw new RegraNegocioException("Apenas agendamentos ativos podem ser cancelados");
        }
        status = StatusAgendamento.CANCELADO;
    }

    public void concluir() {
        if (status != StatusAgendamento.AGENDADO) {
            throw new RegraNegocioException("Apenas agendamentos ativos podem ser concluidos");
        }
        status = StatusAgendamento.CONCLUIDO;
    }

    public boolean envolve(Long usuarioId) {
        return cliente.getId().equals(usuarioId) || profissional.getId().equals(usuarioId);
    }

    public Long getId() {
        return id;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public Usuario getProfissional() {
        return profissional;
    }

    public Servico getServico() {
        return servico;
    }

    public LocalDateTime getInicio() {
        return inicio;
    }

    public LocalDateTime getFim() {
        return fim;
    }

    public StatusAgendamento getStatus() {
        return status;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
