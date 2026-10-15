// Agregado mensal — nunca digitado, sempre calculado a partir dos registros de Payment do mês
// (soma de revenue, soma de atrasados = delinquency).
export interface Financial {
  id: string
  gymId: string
  referenceMonth: string
  revenue: number
  expenses: number
  delinquency: number
}