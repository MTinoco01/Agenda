import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { Servico } from '../../api/types'
import { Alerta, Botao, Campo, Cartao, Carregando, Titulo, Vazio } from '../../components/ui'
import { formatarPreco } from '../../lib/formato'

type Formulario = { nome: string; duracaoMinutos: number; preco: number; ativo: boolean }

export function MeusServicos() {
  const queryClient = useQueryClient()
  const [editando, setEditando] = useState<Servico | null>(null)

  const servicos = useQuery({
    queryKey: ['meus-servicos'],
    queryFn: () => api.get<Servico[]>('/me/servicos'),
  })

  const salvar = useMutation({
    mutationFn: (dados: Formulario) =>
      editando ? api.put<Servico>(`/me/servicos/${editando.id}`, dados) : api.post<Servico>('/me/servicos', dados),
    onSuccess: () => {
      setEditando(null)
      queryClient.invalidateQueries({ queryKey: ['meus-servicos'] })
      queryClient.invalidateQueries({ queryKey: ['servicos'] })
    },
  })

  const alternarAtivo = useMutation({
    mutationFn: (s: Servico) =>
      api.put<Servico>(`/me/servicos/${s.id}`, { ...s, ativo: !s.ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meus-servicos'] }),
  })

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    salvar.mutate(
      {
        nome: String(form.get('nome')),
        duracaoMinutos: Number(form.get('duracao')),
        preco: Number(String(form.get('preco')).replace(',', '.')),
        ativo: editando?.ativo ?? true,
      },
      { onSuccess: () => (e.target as HTMLFormElement).reset() },
    )
  }

  const campos = salvar.error instanceof ApiError ? (salvar.error.campos ?? {}) : {}

  return (
    <>
      <Titulo subtitulo="O que você oferece, quanto tempo leva e quanto custa.">Serviços</Titulo>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {servicos.isPending && <Carregando />}
          {servicos.isError && <Alerta>{servicos.error.message}</Alerta>}
          {servicos.data?.length === 0 && <Vazio>Cadastre seu primeiro serviço ao lado.</Vazio>}
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white empty:hidden">
            {servicos.data?.map((s) => (
              <li key={s.id} className={`flex flex-wrap items-center gap-3 p-4 ${s.ativo ? '' : 'opacity-60'}`}>
                <span className="min-w-40 flex-1">
                  <span className="block font-medium">
                    {s.nome}
                    {!s.ativo && <span className="ml-2 text-xs font-normal text-slate-500">(inativo)</span>}
                  </span>
                  <span className="text-sm text-slate-600">
                    {s.duracaoMinutos} min · {formatarPreco(s.preco)}
                  </span>
                </span>
                <Botao variante="fantasma" onClick={() => setEditando(s)}>
                  Editar
                </Botao>
                <Botao
                  variante="secundario"
                  disabled={alternarAtivo.isPending}
                  onClick={() => alternarAtivo.mutate(s)}
                >
                  {s.ativo ? 'Desativar' : 'Ativar'}
                </Botao>
              </li>
            ))}
          </ul>
        </div>

        <Cartao className="lg:self-start">
          <h2 className="mb-4 font-semibold">{editando ? 'Editar serviço' : 'Novo serviço'}</h2>
          {/* key força o formulario a recarregar os valores ao trocar o servico editado */}
          <form key={editando?.id ?? 'novo'} onSubmit={enviar} className="space-y-4">
            {salvar.isError && <Alerta>{salvar.error.message}</Alerta>}
            <Campo rotulo="Nome" name="nome" required defaultValue={editando?.nome} erro={campos.nome} />
            <div className="grid grid-cols-2 gap-3">
              <Campo
                rotulo="Duração (min)"
                name="duracao"
                type="number"
                min={5}
                max={480}
                step={5}
                required
                defaultValue={editando?.duracaoMinutos ?? 30}
                erro={campos.duracaoMinutos}
              />
              <Campo
                rotulo="Preço (R$)"
                name="preco"
                inputMode="decimal"
                required
                defaultValue={editando?.preco.toFixed(2).replace('.', ',')}
                placeholder="50,00"
                erro={campos.preco}
              />
            </div>
            <div className="flex gap-2">
              <Botao type="submit" disabled={salvar.isPending} className="flex-1">
                {salvar.isPending ? 'Salvando…' : editando ? 'Salvar' : 'Adicionar'}
              </Botao>
              {editando && (
                <Botao type="button" variante="secundario" onClick={() => setEditando(null)}>
                  Cancelar
                </Botao>
              )}
            </div>
          </form>
        </Cartao>
      </div>
    </>
  )
}
