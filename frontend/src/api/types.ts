// Espelha os DTOs do backend (br.com.agenda.*Dtos)

export type Role = 'CLIENTE' | 'PROFISSIONAL' | 'ADMIN'

export type Usuario = {
  id: number
  nome: string
  email: string
  role: Role
}

export type TokenResponse = {
  token: string
  expiraEmSegundos: number
  usuario: Usuario
}

export type Profissional = {
  id: number
  nome: string
}

export type Servico = {
  id: number
  nome: string
  duracaoMinutos: number
  preco: number
  ativo: boolean
}

export type DiaSemana =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export type Janela = {
  id?: number
  diaSemana: DiaSemana
  horaInicio: string
  horaFim: string
}

export type StatusAgendamento = 'AGENDADO' | 'CANCELADO' | 'CONCLUIDO'

export type Agendamento = {
  id: number
  inicio: string
  fim: string
  status: StatusAgendamento
  servicoId: number
  servico: string
  preco: number
  clienteId: number
  cliente: string
  profissionalId: number
  profissional: string
}
