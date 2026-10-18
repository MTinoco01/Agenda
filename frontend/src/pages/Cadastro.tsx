import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import type { Role } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Alerta, Botao, Campo, Cartao } from '../components/ui'
import { rotaInicial } from '../lib/navegacao'

const PERFIS: { valor: Role; titulo: string; descricao: string }[] = [
  { valor: 'CLIENTE', titulo: 'Quero agendar', descricao: 'Marcar horários com profissionais' },
  { valor: 'PROFISSIONAL', titulo: 'Sou profissional', descricao: 'Oferecer serviços e receber agendamentos' },
]

export function Cadastro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('CLIENTE')
  const [erro, setErro] = useState<string | null>(null)
  const [campos, setCampos] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setErro(null)
    setCampos({})
    setEnviando(true)
    try {
      const usuario = await registrar({
        nome: String(form.get('nome')),
        email: String(form.get('email')),
        senha: String(form.get('senha')),
        role,
      })
      navigate(rotaInicial(usuario), { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setErro(err.message)
        setCampos(err.campos ?? {})
      } else {
        setErro('Falha de conexão com o servidor')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">Criar conta</h1>
      <Cartao>
        <form onSubmit={enviar} className="space-y-4">
          {erro && <Alerta>{erro}</Alerta>}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Como você vai usar?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {PERFIS.map((p) => (
                <label
                  key={p.valor}
                  className={`cursor-pointer rounded-lg border p-3 text-sm ${role === p.valor ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={p.valor}
                    checked={role === p.valor}
                    onChange={() => setRole(p.valor)}
                    className="sr-only"
                  />
                  <span className="block font-medium">{p.titulo}</span>
                  <span className="text-slate-600">{p.descricao}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Campo rotulo="Nome" name="nome" autoComplete="name" required erro={campos.nome} />
          <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required erro={campos.email} />
          <Campo
            rotulo="Senha (mínimo 8 caracteres)"
            name="senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            erro={campos.senha}
          />
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Criando…' : 'Criar conta'}
          </Botao>
        </form>
      </Cartao>
      <p className="mt-4 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-teal-800 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
