// Registro de cada período em que um Aluno esteve num Plano. Trocar de plano fecha
// o período atual (endDate) e abre um novo — nunca reescreve o histórico anterior.
import type { HistoricoPlano } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedHistoricoPlanos } from './seed'

const KEY = 'plan-history'

export function inicializarHistoricoPlanos(): void {
  ensureSeeded<HistoricoPlano>(KEY, seedHistoricoPlanos)
}

export function obterHistoricoPlanos(): HistoricoPlano[] {
  return readCollection<HistoricoPlano>(KEY, seedHistoricoPlanos)
}

export function obterHistoricoPlanosPorAluno(alunoId: string): HistoricoPlano[] {
  return obterHistoricoPlanos().filter((historico) => historico.alunoId === alunoId)
}

export function salvarHistoricoPlano(historico: HistoricoPlano): void {
  const current = obterHistoricoPlanos()
  const index = current.findIndex((item) => item.id === historico.id)
  if (index === -1) {
    writeCollection(KEY, [...current, historico])
  } else {
    const updated = [...current]
    updated[index] = historico
    writeCollection(KEY, updated)
  }
}

// Fecha o período em aberto do aluno (se houver) na data informada.
export function encerrarPlanoAtualNoHistorico(alunoId: string, data: string): void {
  obterHistoricoPlanosPorAluno(alunoId)
    .filter((historico) => historico.endDate === null)
    .forEach((historico) => salvarHistoricoPlano({ ...historico, endDate: data }))
}

// Registra a entrada do aluno num plano: fecha o período anterior e abre um novo.
export function registrarTrocaDePlano(alunoId: string, planoId: string, data: string): void {
  encerrarPlanoAtualNoHistorico(alunoId, data)
  salvarHistoricoPlano({ id: crypto.randomUUID(), alunoId, planoId, startDate: data, endDate: null })
}
