import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AgendarHorario } from './pages/AgendarHorario'
import { Cadastro } from './pages/Cadastro'
import { Entrar } from './pages/Entrar'
import { Inicio } from './pages/Inicio'
import { MeusAgendamentos } from './pages/MeusAgendamentos'
import { AgendaDoProfissional } from './pages/painel/AgendaDoProfissional'
import { MeusHorarios } from './pages/painel/MeusHorarios'
import { MeusServicos } from './pages/painel/MeusServicos'
import { Protegida, SoVisitante } from './rotas'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="profissionais/:id" element={<AgendarHorario />} />
        <Route path="entrar" element={<SoVisitante><Entrar /></SoVisitante>} />
        <Route path="cadastro" element={<SoVisitante><Cadastro /></SoVisitante>} />
        <Route path="meus-agendamentos" element={<Protegida role="CLIENTE"><MeusAgendamentos /></Protegida>} />
        <Route path="painel" element={<Protegida role="PROFISSIONAL"><AgendaDoProfissional /></Protegida>} />
        <Route path="painel/servicos" element={<Protegida role="PROFISSIONAL"><MeusServicos /></Protegida>} />
        <Route path="painel/horarios" element={<Protegida role="PROFISSIONAL"><MeusHorarios /></Protegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
