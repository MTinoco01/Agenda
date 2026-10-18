import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-teal-700 text-white hover:bg-teal-800 disabled:bg-teal-700/50',
  secundario: 'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50',
  perigo: 'bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50',
  fantasma: 'text-slate-600 hover:bg-slate-100',
}

export function Botao({
  variante = 'primario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  )
}

export function Campo({
  rotulo,
  erro,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{rotulo}</span>
      <input
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-xs focus:outline-2 focus:outline-teal-600 ${erro ? 'border-red-400' : 'border-slate-300'}`}
        aria-invalid={erro ? true : undefined}
        {...props}
      />
      {erro && <span className="mt-1 block text-xs text-red-700">{erro}</span>}
    </label>
  )
}

export function Selecao({
  rotulo,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{rotulo}</span>
      <select
        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-2 focus:outline-teal-600"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>{children}</div>
}

export function Alerta({ tipo = 'erro', children }: { tipo?: 'erro' | 'sucesso'; children: ReactNode }) {
  const estilo = tipo === 'erro' ? 'bg-red-50 text-red-800 ring-red-200' : 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm ring-1 ${estilo}`}>
      {children}
    </div>
  )
}

export function Titulo({ children, subtitulo }: { children: ReactNode; subtitulo?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      {subtitulo && <p className="mt-1 text-sm text-slate-600">{subtitulo}</p>}
    </div>
  )
}

export function Carregando() {
  return <p className="py-8 text-center text-sm text-slate-500">Carregando…</p>
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">{children}</p>
}
