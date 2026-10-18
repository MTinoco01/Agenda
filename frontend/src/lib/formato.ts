import type { DiaSemana, StatusAgendamento } from '../api/types'

// O backend envia LocalDateTime sem fuso ("2026-10-19T09:00:00"), que o navegador le como horario local

const dataLonga = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
const dataCurta = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarDataLonga = (iso: string) => dataLonga.format(new Date(iso))
export const formatarDataCurta = (iso: string) => dataCurta.format(new Date(iso))
export const formatarHora = (iso: string) => hora.format(new Date(iso))
export const formatarPreco = (valor: number) => moeda.format(valor)

/** Data local no formato yyyy-mm-dd, usado pelo input type=date e pela API. */
export function dataISO(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export const DIAS_SEMANA: { valor: DiaSemana; nome: string }[] = [
  { valor: 'MONDAY', nome: 'Segunda' },
  { valor: 'TUESDAY', nome: 'Terça' },
  { valor: 'WEDNESDAY', nome: 'Quarta' },
  { valor: 'THURSDAY', nome: 'Quinta' },
  { valor: 'FRIDAY', nome: 'Sexta' },
  { valor: 'SATURDAY', nome: 'Sábado' },
  { valor: 'SUNDAY', nome: 'Domingo' },
]

export const ROTULO_STATUS: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
}
