import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api/client'
import type { DiaSemana, Janela } from '../../api/types'
import { Alerta, Botao, Carregando, Titulo } from '../../components/ui'
import { DIAS_SEMANA } from '../../lib/formato'

// "09:00:00" -> "09:00" para o input type=time
const hhmm = (h: string) => h.slice(0, 5)

export function MeusHorarios() {
  const disponibilidades = useQuery({
    queryKey: ['minhas-disponibilidades'],
    queryFn: () => api.get<Janela[]>('/me/disponibilidades'),
  })

  return (
    <>
      <Titulo subtitulo="Defina as janelas da semana em que você atende. Os clientes só veem horários dentro delas.">
        Horários de atendimento
      </Titulo>
      {disponibilidades.isPending && <Carregando />}
      {disponibilidades.isError && <Alerta>{disponibilidades.error.message}</Alerta>}
      {disponibilidades.data && (
        <EditorDeGrade inicial={disponibilidades.data.map((j) => ({ ...j, horaInicio: hhmm(j.horaInicio), horaFim: hhmm(j.horaFim) }))} />
      )}
    </>
  )
}

function EditorDeGrade({ inicial }: { inicial: Janela[] }) {
  const queryClient = useQueryClient()
  const [janelas, setJanelas] = useState<Janela[]>(inicial)
  const [alterado, setAlterado] = useState(false)

  const salvar = useMutation({
    mutationFn: () =>
      api.put<Janela[]>(
        '/me/disponibilidades',
        janelas.map(({ diaSemana, horaInicio, horaFim }) => ({ diaSemana, horaInicio, horaFim })),
      ),
    onSuccess: (salvas) => {
      queryClient.setQueryData(['minhas-disponibilidades'], salvas)
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
      setAlterado(false)
    },
  })

  function mudar(nova: Janela[]) {
    setJanelas(nova)
    setAlterado(true)
    salvar.reset()
  }

  function adicionar(dia: DiaSemana) {
    const doDia = janelas.filter((j) => j.diaSemana === dia)
    const ultima = doDia[doDia.length - 1]
    // Sugere a proxima janela logo depois da ultima (ex.: tarde depois da manha)
    const sugestao = ultima ? { horaInicio: ultima.horaFim, horaFim: '18:00' } : { horaInicio: '09:00', horaFim: '18:00' }
    mudar([...janelas, { diaSemana: dia, ...sugestao }])
  }

  function atualizar(indice: number, campo: 'horaInicio' | 'horaFim', valor: string) {
    mudar(janelas.map((j, i) => (i === indice ? { ...j, [campo]: valor } : j)))
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {DIAS_SEMANA.map((dia) => {
          const doDia = janelas.map((j, i) => ({ j, i })).filter(({ j }) => j.diaSemana === dia.valor)
          return (
            <li key={dia.valor} className="flex flex-wrap items-start gap-x-6 gap-y-3 p-4">
              <span className="w-24 pt-2 font-medium">{dia.nome}</span>
              <div className="flex flex-1 flex-col gap-2">
                {doDia.length === 0 && <span className="pt-2 text-sm text-slate-400">Não atende</span>}
                {doDia.map(({ j, i }) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                    <input
                      type="time"
                      aria-label={`${dia.nome}: início`}
                      value={j.horaInicio}
                      onChange={(e) => atualizar(i, 'horaInicio', e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 tabular-nums"
                    />
                    <span className="text-slate-500">até</span>
                    <input
                      type="time"
                      aria-label={`${dia.nome}: fim`}
                      value={j.horaFim}
                      onChange={(e) => atualizar(i, 'horaFim', e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 tabular-nums"
                    />
                    <button
                      onClick={() => mudar(janelas.filter((_, k) => k !== i))}
                      className="rounded-md px-2 py-1 text-slate-500 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Remover janela de ${dia.nome}`}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
              <Botao variante="fantasma" onClick={() => adicionar(dia.valor)}>
                + Janela
              </Botao>
            </li>
          )
        })}
      </ul>

      {salvar.isError && <Alerta>{salvar.error.message}</Alerta>}
      {salvar.isSuccess && <Alerta tipo="sucesso">Horários salvos.</Alerta>}
      <div className="flex justify-end">
        <Botao disabled={!alterado || salvar.isPending} onClick={() => salvar.mutate()}>
          {salvar.isPending ? 'Salvando…' : 'Salvar horários'}
        </Botao>
      </div>
    </div>
  )
}
