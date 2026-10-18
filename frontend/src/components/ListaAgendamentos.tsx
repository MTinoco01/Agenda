import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Agendamento, StatusAgendamento } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { formatarDataLonga, formatarHora, formatarPreco, ROTULO_STATUS } from '../lib/formato'
import { Alerta, Botao, Vazio } from './ui'

const COR_STATUS: Record<StatusAgendamento, string> = {
  AGENDADO: 'bg-teal-50 text-teal-800 ring-teal-200',
  CANCELADO: 'bg-slate-100 text-slate-600 ring-slate-200',
  CONCLUIDO: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
}

/** Lista agrupada por dia. Cliente pode cancelar; profissional pode cancelar ou concluir. */
export function ListaAgendamentos({ itens, vazio }: { itens: Agendamento[]; vazio: string }) {
  const { usuario } = useAuth()
  const queryClient = useQueryClient()
  const profissional = usuario?.role === 'PROFISSIONAL'

  const acao = useMutation({
    mutationFn: ({ id, tipo }: { id: number; tipo: 'cancelar' | 'concluir' }) =>
      api.patch<Agendamento>(`/agendamentos/${id}/${tipo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] })
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
    },
  })

  if (itens.length === 0) return <Vazio>{vazio}</Vazio>

  const porDia = new Map<string, Agendamento[]>()
  for (const a of itens) {
    const dia = a.inicio.slice(0, 10)
    porDia.set(dia, [...(porDia.get(dia) ?? []), a])
  }

  return (
    <div className="space-y-6">
      {acao.isError && <Alerta>{acao.error.message}</Alerta>}
      {[...porDia.entries()].map(([dia, lista]) => (
        <section key={dia}>
          <h3 className="mb-2 text-sm font-semibold text-slate-500 first-letter:uppercase">{formatarDataLonga(lista[0].inicio)}</h3>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {lista.map((a) => {
              const ativo = a.status === 'AGENDADO'
              const ocupado = acao.isPending && acao.variables?.id === a.id
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <span className="w-28 font-semibold tabular-nums">
                    {formatarHora(a.inicio)}–{formatarHora(a.fim)}
                  </span>
                  <span className="min-w-40 flex-1">
                    <span className="block font-medium">{a.servico}</span>
                    <span className="text-sm text-slate-600">
                      {profissional ? a.cliente : a.profissional} · {formatarPreco(a.preco)}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${COR_STATUS[a.status]}`}>
                    {ROTULO_STATUS[a.status]}
                  </span>
                  {ativo && (
                    <span className="flex gap-2">
                      {profissional && (
                        <Botao
                          variante="secundario"
                          disabled={ocupado}
                          onClick={() => acao.mutate({ id: a.id, tipo: 'concluir' })}
                        >
                          Concluir
                        </Botao>
                      )}
                      <Botao
                        variante="perigo"
                        disabled={ocupado}
                        onClick={() => {
                          if (confirm('Cancelar este agendamento?')) acao.mutate({ id: a.id, tipo: 'cancelar' })
                        }}
                      >
                        Cancelar
                      </Botao>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

