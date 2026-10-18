import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Agendamento } from '../api/types'

export function useMeusAgendamentos() {
  return useQuery({
    queryKey: ['meus-agendamentos'],
    queryFn: () => api.get<Agendamento[]>('/agendamentos/meus'),
  })
}

/** Separa proximos (ordem crescente) de anteriores (mais recentes primeiro). */
export function separarPorTempo(itens: Agendamento[]) {
  const agora = Date.now()
  const proximos = itens
    .filter((a) => new Date(a.fim).getTime() >= agora && a.status !== 'CANCELADO')
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
  const anteriores = itens
    .filter((a) => !proximos.includes(a))
    .sort((a, b) => b.inicio.localeCompare(a.inicio))
  return { proximos, anteriores }
}
