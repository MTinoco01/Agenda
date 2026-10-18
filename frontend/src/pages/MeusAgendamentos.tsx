import { Link, useLocation } from 'react-router-dom'
import { ListaAgendamentos } from '../components/ListaAgendamentos'
import { separarPorTempo, useMeusAgendamentos } from '../lib/agendamentos'
import { Alerta, Carregando, Titulo } from '../components/ui'

export function MeusAgendamentos() {
  const agendamentos = useMeusAgendamentos()
  const recemAgendado = (useLocation().state as { agendado?: boolean } | null)?.agendado
  const { proximos, anteriores } = separarPorTempo(agendamentos.data ?? [])

  return (
    <>
      <Titulo subtitulo={<Link to="/" className="text-teal-800 hover:underline">+ Marcar novo horário</Link>}>
        Meus agendamentos
      </Titulo>
      {recemAgendado && (
        <div className="mb-6">
          <Alerta tipo="sucesso">Agendamento confirmado!</Alerta>
        </div>
      )}
      {agendamentos.isPending && <Carregando />}
      {agendamentos.isError && <Alerta>{agendamentos.error.message}</Alerta>}
      {agendamentos.data && (
        <div className="space-y-10">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Próximos</h2>
            <ListaAgendamentos itens={proximos} vazio="Você não tem horários marcados." />
          </div>
          {anteriores.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
              <ListaAgendamentos itens={anteriores} vazio="" />
            </div>
          )}
        </div>
      )}
    </>
  )
}
