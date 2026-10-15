// Padrão Repository: esconde o localStorage por trás de funções com nome claro.
// Nenhuma tela deve chamar localStorage direto — só essas funções daqui.
import type { User, UserRole } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedUsers } from './seed'

const KEY = 'users'

export function initUsers(): void {
  ensureSeeded<User>(KEY, seedUsers)
}

export function getUsers(): User[] {
  return readCollection<User>(KEY, seedUsers)
}

export function findUserByCredentials(email: string, password: string): User | undefined {
  return getUsers().find((user) => user.email === email && user.password === password)
}

export function findDemoUserByRole(role: UserRole): User | undefined {
  return getUsers().find((user) => user.role === role)
}