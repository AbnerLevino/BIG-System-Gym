import type { ObjetivoAluno } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedObjetivosAlunos } from './seed'

const KEY = 'student-goals-questionnaire'

export function inicializarObjetivosAlunos(): void {
  ensureSeeded<ObjetivoAluno>(KEY, seedObjetivosAlunos)
}

export function obterObjetivosAlunos(): ObjetivoAluno[] {
  return readCollection<ObjetivoAluno>(KEY, seedObjetivosAlunos)
}

// Resposta mais recente do aluno (refazer o questionário cria uma nova).
export function obterObjetivoDoAluno(alunoId: string): ObjetivoAluno | undefined {
  return obterObjetivosAlunos()
    .filter((objetivo) => objetivo.alunoId === alunoId)
    .sort((a, b) => b.respondidoEm.localeCompare(a.respondidoEm))[0]
}

export function salvarObjetivoAluno(objetivo: ObjetivoAluno): void {
  const current = obterObjetivosAlunos()
  const index = current.findIndex((item) => item.id === objetivo.id)
  if (index === -1) {
    writeCollection(KEY, [...current, objetivo])
  } else {
    const updated = [...current]
    updated[index] = objetivo
    writeCollection(KEY, updated)
  }
}
