import type { Exercicio } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedExercicios } from './seed'

const KEY = 'exercises'

export function inicializarExercicios(): void {
  ensureSeeded<Exercicio>(KEY, seedExercicios)
}

export function obterExercicios(): Exercicio[] {
  return readCollection<Exercicio>(KEY, seedExercicios)
}

export function obterExercicioPorId(id: string): Exercicio | undefined {
  return obterExercicios().find((exercicio) => exercicio.id === id)
}

export function obterExerciciosPorGrupoMuscular(grupo: Exercicio['grupoMuscular']): Exercicio[] {
  return obterExercicios().filter((exercicio) => exercicio.grupoMuscular === grupo)
}
