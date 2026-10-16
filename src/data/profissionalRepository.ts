import type { Profissional } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedProfissionais } from './seed'

const KEY = 'professionals'

export function inicializarProfissionais(): void {
  ensureSeeded<Profissional>(KEY, seedProfissionais)
}

export function obterProfissionais(): Profissional[] {
  return readCollection<Profissional>(KEY, seedProfissionais)
}

export function obterProfissionalPorId(id: string): Profissional | undefined {
  return obterProfissionais().find((profissional) => profissional.id === id)
}
