import type { Aluno, CheckIn } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedCheckins } from './seed'
import { obterPagamentosPorAluno } from './pagamentoRepository'

const KEY = 'checkins'

export function inicializarCheckins(): void {
  ensureSeeded<CheckIn>(KEY, seedCheckins)
}

export function obterCheckins(): CheckIn[] {
  return readCollection<CheckIn>(KEY, seedCheckins)
}

export function obterCheckinsPorAluno(alunoId: string): CheckIn[] {
  return obterCheckins().filter((checkin) => checkin.alunoId === alunoId)
}

export function registrarCheckin(checkin: CheckIn): void {
  const current = obterCheckins()
  writeCollection(KEY, [...current, checkin])
}

export type MotivoAcesso = 'granted' | 'cancelled' | 'latePayment'

export interface AvaliacaoAcesso {
  liberado: boolean
  motivo: MotivoAcesso
}

// Acesso à catraca nunca é salvo — é recalculado a cada check-in, nesta ordem:
// matrícula cancelada bloqueia primeiro; depois, pagamento atrasado; só então libera.
export function avaliarAcesso(aluno: Aluno): AvaliacaoAcesso {
  if (aluno.status === 'cancelled') {
    return { liberado: false, motivo: 'cancelled' }
  }

  const pagamentos = obterPagamentosPorAluno(aluno.id)
  if (pagamentos.some((pagamento) => pagamento.status === 'late')) {
    return { liberado: false, motivo: 'latePayment' }
  }

  return { liberado: true, motivo: 'granted' }
}
