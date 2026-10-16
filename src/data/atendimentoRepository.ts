import type { Atendimento } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAtendimentos } from './seed'

const KEY = 'assignments'

export function inicializarAtendimentos(): void {
  ensureSeeded<Atendimento>(KEY, seedAtendimentos)
}

export function obterAtendimentos(): Atendimento[] {
  return readCollection<Atendimento>(KEY, seedAtendimentos)
}

export function obterAtendimentosPorAluno(alunoId: string): Atendimento[] {
  return obterAtendimentos().filter((atendimento) => atendimento.alunoId === alunoId)
}

export function obterAtendimentosPorProfissional(profissionalId: string): Atendimento[] {
  return obterAtendimentos().filter((atendimento) => atendimento.profissionalId === profissionalId)
}

export function obterAtendimentoPersonalPorAluno(alunoId: string): Atendimento | undefined {
  return obterAtendimentosPorAluno(alunoId).find((atendimento) => atendimento.type === 'personal')
}

export function salvarAtendimento(atendimento: Atendimento): void {
  const current = obterAtendimentos()
  const index = current.findIndex((item) => item.id === atendimento.id)
  if (index === -1) {
    writeCollection(KEY, [...current, atendimento])
  } else {
    const updated = [...current]
    updated[index] = atendimento
    writeCollection(KEY, updated)
  }
}
