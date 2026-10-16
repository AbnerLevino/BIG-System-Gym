import type { Pagamento } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPagamentos } from './seed'

const KEY = 'payments'

export function inicializarPagamentos(): void {
  ensureSeeded<Pagamento>(KEY, seedPagamentos)
}

export function obterPagamentos(): Pagamento[] {
  return readCollection<Pagamento>(KEY, seedPagamentos)
}

export function obterPagamentosPorAluno(alunoId: string): Pagamento[] {
  return obterPagamentos().filter((pagamento) => pagamento.alunoId === alunoId)
}
