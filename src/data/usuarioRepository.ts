// Padrão Repository: esconde o localStorage por trás de funções com nome claro.
// Nenhuma tela deve chamar localStorage direto — só essas funções daqui.
import type { Usuario, PapelUsuario } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedUsuarios } from './seed'

const KEY = 'users'

export function inicializarUsuarios(): void {
  ensureSeeded<Usuario>(KEY, seedUsuarios)
}

export function obterUsuarios(): Usuario[] {
  return readCollection<Usuario>(KEY, seedUsuarios)
}

export function buscarUsuarioPorCredenciais(email: string, password: string): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.email === email && usuario.password === password)
}

export function buscarUsuarioPorEmail(email: string): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.email === email)
}

export function salvarUsuario(usuario: Usuario): void {
  const current = obterUsuarios()
  const index = current.findIndex((item) => item.id === usuario.id)
  if (index === -1) {
    writeCollection(KEY, [...current, usuario])
  } else {
    const updated = [...current]
    updated[index] = usuario
    writeCollection(KEY, updated)
  }
}

export function buscarUsuarioDemoPorPapel(role: PapelUsuario): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.role === role)
}
