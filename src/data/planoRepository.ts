import type { Plano } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPlanos } from './seed'

const KEY = 'plans'

export function inicializarPlanos(): void {
  ensureSeeded<Plano>(KEY, seedPlanos)
}

export function obterPlanos(): Plano[] {
  return readCollection<Plano>(KEY, seedPlanos)
}

export function obterPlanoPorId(id: string): Plano | undefined {
  return obterPlanos().find((plano) => plano.id === id)
}
