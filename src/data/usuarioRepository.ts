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

// Conta pendente de ativação (password vazio) nunca casa com credencial nenhuma.
export function buscarUsuarioPorCredenciais(email: string, password: string): Usuario | undefined {
  if (password === '') return undefined
  return obterUsuarios().find((usuario) => usuario.email === email && usuario.password === password)
}

// Usuario criado pelo atendente que ainda não definiu a senha pelo convite.
export function usuarioPendenteDeSenha(usuario: Usuario): boolean {
  return usuario.password === ''
}

export function obterUsuarioPorId(id: string): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.id === id)
}

// E-mail é comparado sem diferenciar maiúsculas e sem espaços nas pontas.
export function buscarUsuarioPorEmail(email: string): Usuario | undefined {
  const normalizado = email.trim().toLowerCase()
  return obterUsuarios().find((usuario) => usuario.email.trim().toLowerCase() === normalizado)
}

// Usuario de login ligado a um registro de negócio (ex: o Aluno) pelo refId.
export function buscarUsuarioPorRefId(refId: string): Usuario | undefined {
  return obterUsuarios().find((usuario) => usuario.refId === refId)
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
