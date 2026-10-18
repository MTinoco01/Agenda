import { Link } from 'react-router-dom'
import { ListaAgendamentos } from '../../components/ListaAgendamentos'
import { separarPorTempo, useMeusAgendamentos } from '../../lib/agendamentos'
import { Alerta, Carregando, Titulo } from '../../components/ui'

export function AgendaDoProfissional() {
  const agendamentos = useMeusAgendamentos()
  const { proximos, anteriores } = separarPorTempo(agendamentos.data ?? [])

  return (
    <>
      <Titulo subtitulo="Horários marcados pelos seus clientes.">Sua agenda</Titulo>
      {agendamentos.isPending && <Carregando />}
      {agendamentos.isError && <Alerta>{agendamentos.error.message}</Alerta>}
      {agendamentos.data && (
        <div className="space-y-10">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Próximos atendimentos</h2>
            <ListaAgendamentos
              itens={proximos}
              vazio="Nenhum atendimento marcado. Confira se você já cadastrou serviços e horários."
            />
            {proximos.length === 0 && (
              <p className="mt-3 text-center text-sm">
                <Link to="/painel/servicos" className="text-teal-800 hover:underline">Serviços</Link>
                {' · '}
                <Link to="/painel/horarios" className="text-teal-800 hover:underline">Horários de atendimento</Link>
              </p>
            )}
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
