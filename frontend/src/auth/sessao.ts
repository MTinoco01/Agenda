import type { TokenResponse, Usuario } from '../api/types'

export type Sessao = {
  token: string
  expiraEm: number
  usuario: Usuario
}

const CHAVE = 'agenda.sessao'

// Copia em memoria: continua funcionando se o localStorage estiver bloqueado
let atual: Sessao | null = lerDoStorage()

function lerDoStorage(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Sessao) : null
  } catch {
    return null
  }
}

export function carregarSessao(): Sessao | null {
  return atual && atual.expiraEm > Date.now() ? atual : null
}

export function salvarSessao(resp: TokenResponse): Sessao {
  atual = {
    token: resp.token,
    expiraEm: Date.now() + resp.expiraEmSegundos * 1000,
    usuario: resp.usuario,
  }
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atual))
  } catch {
    // Sem storage (aba anonima, bloqueio): a sessao vale so enquanto a pagina estiver aberta
  }
  return atual
}

export function limparSessao() {
  atual = null
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // ignora
  }
}
