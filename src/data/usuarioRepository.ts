// Padrão Repository: esconde o localStorage por trás de funções com nome claro.
// Nenhuma tela deve chamar localStorage direto — só essas funções daqui.
import type { Usuario, PapelUsuario } from '../types'
import { readCollection, ensureSeeded } from './storage'
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

export function buscarUsuarioDemoPorPapel(role: PapelUsuario): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.role === role)
}
