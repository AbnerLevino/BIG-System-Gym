// Pagamento é gerado automaticamente a partir do plano vigente, nunca lançado manualmente.
// Fluxo: pending -> paid (ou late se passar de dueDate, com lateFee calculado).
export type StatusPagamento = 'pending' | 'paid' | 'late'

export interface Pagamento {
  id: string
  academiaId: string
  alunoId: string
  planoId: string
  originalValue: number
  paidValue: number | null
  lateFee: number
  paymentMethod: string | null
  dueDate: string
  paymentDate: string | null
  status: StatusPagamento
  receiptNumber: string | null
}
