import { carregarSessao } from '../auth/sessao'

/** Erro da API no formato ProblemDetail retornado pelo TratadorDeErros. */
export class ApiError extends Error {
  status: number
  campos?: Record<string, string>

  constructor(status: number, mensagem: string, campos?: Record<string, string>) {
    super(mensagem)
    this.status = status
    this.campos = campos
  }
}

// Chamado quando o token expira ou e invalido; o AuthProvider registra o logout aqui
let aoNaoAutorizado: () => void = () => {}
export function registrarAoNaoAutorizado(fn: () => void) {
  aoNaoAutorizado = fn
}

async function request<T>(metodo: string, rota: string, corpo?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = carregarSessao()?.token
  if (token) headers.Authorization = `Bearer ${token}`

  const resp = await fetch(`/api${rota}`, {
    method: metodo,
    headers,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })

  if (resp.status === 401 && token) aoNaoAutorizado()

  if (!resp.ok) {
    const problema = await resp.json().catch(() => null)
    throw new ApiError(
      resp.status,
      problema?.detail ?? mensagemPadrao(resp.status),
      problema?.campos,
    )
  }
  return resp.status === 204 ? (undefined as T) : resp.json()
}

function mensagemPadrao(status: number) {
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para isso.'
  if (status >= 500) return 'Erro no servidor. Tente de novo em instantes.'
  return 'Não foi possível concluir a operação.'
}

export const api = {
  get: <T>(rota: string) => request<T>('GET', rota),
  post: <T>(rota: string, corpo?: unknown) => request<T>('POST', rota, corpo),
  put: <T>(rota: string, corpo?: unknown) => request<T>('PUT', rota, corpo),
  patch: <T>(rota: string, corpo?: unknown) => request<T>('PATCH', rota, corpo),
}
