// Pagamento é gerado automaticamente a partir do plano vigente, nunca lançado manualmente.
// Fluxo: pending -> paid (ou late se passar de dueDate, com lateFee calculado).
export type StatusPagamento = 'pending' | 'paid' | 'late'

// 'partner' nunca é escolhido na tela — é gerado automático quando o plano é via
// TotalPass/Wellhub (ver Plano.origin).
export type MetodoPagamento = 'cash' | 'creditCard' | 'debitCard' | 'pix' | 'partner'

export interface Pagamento {
  id: string
  academiaId: string
  alunoId: string
  planoId: string
  originalValue: number
  paidValue: number | null
  lateFee: number
  paymentMethod: MetodoPagamento | null
  dueDate: string
  paymentDate: string | null
  status: StatusPagamento
  receiptNumber: string | null
}
