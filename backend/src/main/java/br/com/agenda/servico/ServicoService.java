package br.com.agenda.servico;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.agenda.common.NaoEncontradoException;
import br.com.agenda.servico.ServicoDtos.ServicoRequest;
import br.com.agenda.servico.ServicoDtos.ServicoResponse;
import br.com.agenda.usuario.UsuarioRepository;

@Service
public class ServicoService {

    private final ServicoRepository servicos;
    private final UsuarioRepository usuarios;

    public ServicoService(ServicoRepository servicos, UsuarioRepository usuarios) {
        this.servicos = servicos;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listarDoProfissional(Long profissionalId) {
        return servicos.findByProfissionalIdOrderByNome(profissionalId).stream().map(ServicoResponse::de).toList();
    }

    /** Visao publica: apenas os servicos ativos. */
    @Transactional(readOnly = true)
    public List<ServicoResponse> listarAtivos(Long profissionalId) {
        return servicos.findByProfissionalIdAndAtivoTrueOrderByNome(profissionalId).stream()
                .map(ServicoResponse::de).toList();
    }

    @Transactional
    public ServicoResponse criar(Long profissionalId, ServicoRequest req) {
        Servico servico = new Servico(usuarios.getReferenceById(profissionalId), req.nome().trim(),
                req.duracaoMinutos(), req.preco());
        return ServicoResponse.de(servicos.save(servico));
    }

    @Transactional
    public ServicoResponse atualizar(Long profissionalId, Long servicoId, ServicoRequest req) {
        Servico servico = servicos.findById(servicoId)
                .filter(s -> s.pertenceA(profissionalId))
                .orElseThrow(() -> new NaoEncontradoException("Servico nao encontrado"));
        boolean ativo = req.ativo() == null ? servico.isAtivo() : req.ativo();
        servico.atualizar(req.nome().trim(), req.duracaoMinutos(), req.preco(), ativo);
        return ServicoResponse.de(servico);
    }
}
