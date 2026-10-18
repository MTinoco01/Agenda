import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Role } from './api/types'
import { useAuth } from './auth/AuthContext'
import { rotaInicial } from './lib/navegacao'

/** Exige login e, opcionalmente, um perfil especifico. */
export function Protegida({ role, children }: { role?: Role; children: ReactNode }) {
  const { usuario } = useAuth()
  const location = useLocation()
  if (!usuario) return <Navigate to="/entrar" replace state={{ de: location.pathname + location.search }} />
  if (role && usuario.role !== role) return <Navigate to={rotaInicial(usuario)} replace />
  return children
}

/** Telas de login/cadastro: quem ja esta logado vai direto para a sua area. */
export function SoVisitante({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  if (usuario) return <Navigate to={rotaInicial(usuario)} replace />
  return children
}
