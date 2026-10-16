// Agregado mensal — nunca digitado, sempre calculado a partir dos registros de Pagamento do mês
// (soma de revenue, soma de atrasados = delinquency).
export interface Financeiro {
  id: string
  academiaId: string
  referenceMonth: string
  revenue: number
  expenses: number
  delinquency: number
}
