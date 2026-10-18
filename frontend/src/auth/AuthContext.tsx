import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, registrarAoNaoAutorizado } from '../api/client'
import type { Role, TokenResponse, Usuario } from '../api/types'
import { carregarSessao, limparSessao, salvarSessao } from './sessao'

type DadosRegistro = { nome: string; email: string; senha: string; role: Role }

type AuthValor = {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<Usuario>
  registrar: (dados: DadosRegistro) => Promise<Usuario>
  sair: () => void
}

const AuthContext = createContext<AuthValor | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => carregarSessao()?.usuario ?? null)
  const queryClient = useQueryClient()

  const sair = useCallback(() => {
    limparSessao()
    setUsuario(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => registrarAoNaoAutorizado(sair), [sair])

  const entrar = useCallback(async (email: string, senha: string) => {
    const resp = await api.post<TokenResponse>('/auth/login', { email, senha })
    const sessao = salvarSessao(resp)
    setUsuario(sessao.usuario)
    return sessao.usuario
  }, [])

  const registrar = useCallback(async (dados: DadosRegistro) => {
    const resp = await api.post<TokenResponse>('/auth/registro', dados)
    const sessao = salvarSessao(resp)
    setUsuario(sessao.usuario)
    return sessao.usuario
  }, [])

  const valor = useMemo(() => ({ usuario, entrar, registrar, sair }), [usuario, entrar, registrar, sair])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
