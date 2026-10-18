import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Agendamento, Profissional, Servico } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Alerta, Botao, Cartao, Carregando, Titulo, Vazio } from '../components/ui'
import { dataISO, formatarDataLonga, formatarHora, formatarPreco } from '../lib/formato'

const DIAS_A_FRENTE = 14
const diaSemanaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export function AgendarHorario() {
  const { id } = useParams()
  const profissionalId = Number(id)
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const dias = useMemo(() => {
    const hoje = new Date()
    return Array.from({ length: DIAS_A_FRENTE }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i)
      return { iso: dataISO(d), semana: diaSemanaCurto.format(d).replace('.', ''), dia: d.getDate() }
    })
  }, [])

  const [servicoId, setServicoId] = useState<number | null>(null)
  const [data, setData] = useState(dias[0].iso)
  const [horario, setHorario] = useState<string | null>(null)

  const profissional = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => api.get<Profissional[]>('/profissionais'),
    select: (lista) => lista.find((p) => p.id === profissionalId),
  })
  const servicos = useQuery({
    queryKey: ['servicos', profissionalId],
    queryFn: () => api.get<Servico[]>(`/profissionais/${profissionalId}/servicos`),
  })
  const horarios = useQuery({
    queryKey: ['horarios', profissionalId, servicoId, data],
    queryFn: () =>
      api.get<string[]>(`/profissionais/${profissionalId}/horarios-livres?servicoId=${servicoId}&data=${data}`),
    enabled: servicoId !== null,
  })

  const agendar = useMutation({
    mutationFn: () => api.post<Agendamento>('/agendamentos', { servicoId, inicio: horario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] })
      navigate('/meus-agendamentos', { state: { agendado: true } })
    },
    onError: (err) => {
      // Alguem pegou o horario antes: atualiza a grade
      if (err instanceof ApiError && err.status === 409) {
        setHorario(null)
        queryClient.invalidateQueries({ queryKey: ['horarios', profissionalId] })
      }
    },
  })

  const servico = servicos.data?.find((s) => s.id === servicoId)

  function confirmar() {
    if (!usuario) {
      navigate('/entrar', { state: { de: `/profissionais/${profissionalId}` } })
      return
    }
    agendar.mutate()
  }

  return (
    <>
      <Link to="/" className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900">
        ← Profissionais
      </Link>
      <Titulo subtitulo="Escolha o serviço, o dia e o horário.">{profissional.data?.nome ?? 'Agendar'}</Titulo>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* min-w-0: sem isso a fileira de dias alarga o grid em vez de rolar */}
        <div className="min-w-0 space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">1. Serviço</h2>
            {servicos.isPending && <Carregando />}
            {servicos.isError && <Alerta>{servicos.error.message}</Alerta>}
            {servicos.data?.length === 0 && <Vazio>Este profissional ainda não cadastrou serviços.</Vazio>}
            <div className="grid gap-2 sm:grid-cols-2">
              {servicos.data?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServicoId(s.id)
                    setHorario(null)
                  }}
                  aria-pressed={s.id === servicoId}
                  className={`rounded-lg border bg-white p-3 text-left text-sm transition ${s.id === servicoId ? 'border-teal-600 ring-1 ring-teal-600' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <span className="block font-medium">{s.nome}</span>
                  <span className="text-slate-600">
                    {s.duracaoMinutos} min · {formatarPreco(s.preco)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {servicoId !== null && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">2. Dia</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dias.map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setData(d.iso)
                      setHorario(null)
                    }}
                    aria-pressed={d.iso === data}
                    className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 text-sm transition ${d.iso === data ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                  >
                    <span className="text-xs capitalize opacity-80">{d.semana}</span>
                    <span className="text-lg font-semibold">{d.dia}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {servicoId !== null && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">3. Horário</h2>
              {horarios.isPending && <Carregando />}
              {horarios.isError && <Alerta>{horarios.error.message}</Alerta>}
              {horarios.data?.length === 0 && <Vazio>Nenhum horário livre neste dia.</Vazio>}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {horarios.data?.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorario(h)}
                    aria-pressed={h === horario}
                    className={`rounded-lg border py-2 text-sm font-medium tabular-nums transition ${h === horario ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white hover:border-teal-600'}`}
                  >
                    {formatarHora(h)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Cartao>
            <h2 className="mb-3 font-semibold">Resumo</h2>
            <dl className="space-y-2 text-sm">
              <Linha rotulo="Serviço" valor={servico?.nome} />
              <Linha rotulo="Duração" valor={servico && `${servico.duracaoMinutos} min`} />
              <Linha rotulo="Dia" valor={horario && formatarDataLonga(horario)} />
              <Linha rotulo="Horário" valor={horario && formatarHora(horario)} />
              <Linha rotulo="Valor" valor={servico && formatarPreco(servico.preco)} />
            </dl>
            {agendar.isError && (
              <div className="mt-4">
                <Alerta>{agendar.error.message}</Alerta>
              </div>
            )}
            <Botao className="mt-4 w-full" disabled={!horario || agendar.isPending} onClick={confirmar}>
              {agendar.isPending ? 'Agendando…' : usuario ? 'Confirmar agendamento' : 'Entrar para agendar'}
            </Botao>
          </Cartao>
        </aside>
      </div>
    </>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium">{valor || '—'}</dd>
    </div>
  )
}
