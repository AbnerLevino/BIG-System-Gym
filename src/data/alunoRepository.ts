import type { Aluno } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAlunos } from './seed'

const KEY = 'subscribers'

export function inicializarAlunos(): void {
  ensureSeeded<Aluno>(KEY, seedAlunos)
}

export function obterAlunos(): Aluno[] {
  return readCollection<Aluno>(KEY, seedAlunos)
}

export function obterAlunoPorId(id: string): Aluno | undefined {
  return obterAlunos().find((aluno) => aluno.id === id)
}

export function salvarAluno(aluno: Aluno): void {
  const current = obterAlunos()
  const index = current.findIndex((item) => item.id === aluno.id)
  if (index === -1) {
    writeCollection(KEY, [...current, aluno])
  } else {
    const updated = [...current]
    updated[index] = aluno
    writeCollection(KEY, updated)
  }
}
