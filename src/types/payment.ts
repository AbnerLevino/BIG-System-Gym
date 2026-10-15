// Pagamento é gerado automaticamente a partir do plano vigente, nunca lançado manualmente.
// Fluxo: pending -> paid (ou late se passar de dueDate, com lateFee calculado).
export type PaymentStatus = 'pending' | 'paid' | 'late'

export interface Payment {
  id: string
  gymId: string
  subscriberId: string
  planId: string
  originalValue: number
  paidValue: number | null
  lateFee: number
  paymentMethod: string | null
  dueDate: string
  paymentDate: string | null
  status: PaymentStatus
  receiptNumber: string | null
}