import type { Treino } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedTreinos } from './seed'

const KEY = 'workouts'

export function inicializarTreinos(): void {
  ensureSeeded<Treino>(KEY, seedTreinos)
}

export function obterTreinos(): Treino[] {
  return readCollection<Treino>(KEY, seedTreinos)
}

export function obterTreinosPorAluno(alunoId: string): Treino[] {
  return obterTreinos().filter((treino) => treino.alunoId === alunoId)
}

export function obterTreinoAtivoPorAluno(alunoId: string): Treino | undefined {
  return obterTreinosPorAluno(alunoId).find((treino) => treino.active)
}

// Salvar um treino ativo desativa os demais do mesmo aluno (só um ativo por vez, preserva historico).
export function salvarTreino(treino: Treino): void {
  const current = obterTreinos()
  const withDeactivated = treino.active
    ? current.map((item) =>
        item.alunoId === treino.alunoId && item.id !== treino.id ? { ...item, active: false } : item,
      )
    : current

  const index = withDeactivated.findIndex((item) => item.id === treino.id)
  if (index === -1) {
    writeCollection(KEY, [...withDeactivated, treino])
  } else {
    const updated = [...withDeactivated]
    updated[index] = treino
    writeCollection(KEY, updated)
  }
}
