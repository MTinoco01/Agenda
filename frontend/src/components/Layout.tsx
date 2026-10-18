import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function Item({ para, children }: { para: string; children: string }) {
  return (
    <NavLink
      to={para}
      end
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:text-slate-900'}`
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout() {
  const { usuario, sair } = useAuth()
  const profissional = usuario?.role === 'PROFISSIONAL'

  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-teal-800">
            <img src="/favicon.svg" alt="" className="size-7" />
            Agenda
          </Link>
          {usuario && (
            <nav className="flex flex-wrap gap-1">
              {profissional ? (
                <>
                  <Item para="/painel">Agenda</Item>
                  <Item para="/painel/servicos">Serviços</Item>
                  <Item para="/painel/horarios">Horários</Item>
                </>
              ) : (
                <>
                  <Item para="/">Agendar</Item>
                  <Item para="/meus-agendamentos">Meus agendamentos</Item>
                </>
              )}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-3 text-sm">
            {usuario ? (
              <>
                <span className="hidden text-slate-600 sm:inline">{usuario.nome}</span>
                <button onClick={sair} className="font-medium text-slate-600 hover:text-slate-900">
                  Sair
                </button>
              </>
            ) : (
              <Link to="/entrar" className="font-medium text-teal-800">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
