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

// Próxima cobrança em aberto (pending/late) do aluno: a de vencimento mais antigo.
export function obterProximoPagamentoEmAberto(alunoId: string): Pagamento | undefined {
  return obterPagamentosPorAluno(alunoId)
    .filter((pagamento) => pagamento.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
}

// Pagamento que representa a situação atual do aluno: o próximo em aberto, ou,
// se está tudo pago, o último pago (vencimento mais recente).
export function obterPagamentoReferenciaDoAluno(alunoId: string): Pagamento | undefined {
  const emAberto = obterProximoPagamentoEmAberto(alunoId)
  if (emAberto) return emAberto
  return obterPagamentosPorAluno(alunoId).sort((a, b) => b.dueDate.localeCompare(a.dueDate))[0]
}

// Histórico do aluno, do vencimento mais recente pro mais antigo.
export function obterHistoricoDePagamentosDoAluno(alunoId: string): Pagamento[] {
  return obterPagamentosPorAluno(alunoId).sort((a, b) => b.dueDate.localeCompare(a.dueDate))
}
