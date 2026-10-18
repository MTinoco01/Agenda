import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Profissional } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Alerta, Carregando, Titulo, Vazio } from '../components/ui'

export function Inicio() {
  const { usuario } = useAuth()
  const profissionais = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => api.get<Profissional[]>('/profissionais'),
  })

  if (usuario?.role === 'PROFISSIONAL') return <Navigate to="/painel" replace />

  return (
    <>
      <Titulo subtitulo="Escolha com quem você quer marcar um horário.">Agendar</Titulo>
      {profissionais.isPending && <Carregando />}
      {profissionais.isError && <Alerta>{profissionais.error.message}</Alerta>}
      {profissionais.data?.length === 0 && <Vazio>Nenhum profissional cadastrado ainda.</Vazio>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profissionais.data?.map((p) => (
          <li key={p.id}>
            <Link
              to={`/profissionais/${p.id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-teal-600 hover:shadow-sm"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-100 font-semibold text-teal-800">
                {iniciais(p.nome)}
              </span>
              <span>
                <span className="block font-medium">{p.nome}</span>
                <span className="text-sm text-slate-500">Ver serviços e horários →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}
