import type { AvaliacaoFisica } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAvaliacoesFisicas } from './seed'

const KEY = 'physicalAssessments'

export function inicializarAvaliacoesFisicas(): void {
  ensureSeeded<AvaliacaoFisica>(KEY, seedAvaliacoesFisicas)
}

export function obterAvaliacoesFisicas(): AvaliacaoFisica[] {
  return readCollection<AvaliacaoFisica>(KEY, seedAvaliacoesFisicas)
}

export function obterAvaliacoesPorAluno(alunoId: string): AvaliacaoFisica[] {
  return obterAvaliacoesFisicas()
    .filter((avaliacao) => avaliacao.alunoId === alunoId)
    .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))
}

export function obterUltimaAvaliacaoPorAluno(alunoId: string): AvaliacaoFisica | undefined {
  return obterAvaliacoesPorAluno(alunoId)[0]
}

// Lança uma avaliação NOVA (nunca sobrescreve a anterior, pra manter o histórico).
// O tipo é decidido aqui (RF-PRO-03): sem 'principal' ainda -> principal; senão -> mensal.
export function registrarAvaliacaoFisica(dados: Omit<AvaliacaoFisica, 'id' | 'tipo'>): AvaliacaoFisica {
  const jaTemPrincipal = obterAvaliacoesPorAluno(dados.alunoId).some((item) => item.tipo === 'principal')
  const avaliacao: AvaliacaoFisica = {
    ...dados,
    id: crypto.randomUUID(),
    tipo: jaTemPrincipal ? 'mensal' : 'principal',
  }
  salvarAvaliacaoFisica(avaliacao)
  return avaliacao
}

export function salvarAvaliacaoFisica(avaliacao: AvaliacaoFisica): void {
  const current = obterAvaliacoesFisicas()
  const index = current.findIndex((item) => item.id === avaliacao.id)
  if (index === -1) {
    writeCollection(KEY, [...current, avaliacao])
  } else {
    const updated = [...current]
    updated[index] = avaliacao
    writeCollection(KEY, updated)
  }
}
