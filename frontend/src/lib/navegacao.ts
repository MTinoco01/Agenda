import type { Usuario } from '../api/types'

export function rotaInicial(usuario: Usuario) {
  return usuario.role === 'PROFISSIONAL' ? '/painel' : '/'
}
