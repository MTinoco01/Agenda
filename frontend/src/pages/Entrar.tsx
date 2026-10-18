import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Alerta, Botao, Campo, Cartao } from '../components/ui'
import { rotaInicial } from '../lib/navegacao'

export function Entrar() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setErro(null)
    setEnviando(true)
    try {
      const usuario = await entrar(String(form.get('email')), String(form.get('senha')))
      navigate(destino ?? rotaInicial(usuario), { replace: true })
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão com o servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">Entrar</h1>
      <Cartao>
        <form onSubmit={enviar} className="space-y-4">
          {erro && <Alerta>{erro}</Alerta>}
          <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required />
          <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required />
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Entrando…' : 'Entrar'}
          </Botao>
        </form>
      </Cartao>
      <p className="mt-4 text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-teal-800 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
