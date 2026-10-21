import type { Pagamento } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
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

export function salvarPagamento(pagamento: Pagamento): void {
  const current = obterPagamentos()
  const index = current.findIndex((item) => item.id === pagamento.id)
  if (index === -1) {
    writeCollection(KEY, [...current, pagamento])
  } else {
    const updated = [...current]
    updated[index] = pagamento
    writeCollection(KEY, updated)
  }
}
