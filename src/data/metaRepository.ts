import type { Meta } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedMetas } from './seed'

const KEY = 'goals'

export function inicializarMetas(): void {
  ensureSeeded<Meta>(KEY, seedMetas)
}

export function obterMetas(): Meta[] {
  return readCollection<Meta>(KEY, seedMetas)
}

export function obterMetasPorAluno(alunoId: string): Meta[] {
  return obterMetas().filter((meta) => meta.alunoId === alunoId)
}

export function obterMetaAtivaPorAluno(alunoId: string): Meta | undefined {
  return obterMetasPorAluno(alunoId).find((meta) => meta.status === 'inProgress')
}

export function salvarMeta(meta: Meta): void {
  const current = obterMetas()
  const index = current.findIndex((item) => item.id === meta.id)
  if (index === -1) {
    writeCollection(KEY, [...current, meta])
  } else {
    const updated = [...current]
    updated[index] = meta
    writeCollection(KEY, updated)
  }
}
