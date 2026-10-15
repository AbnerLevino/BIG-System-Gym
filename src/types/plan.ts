// Plan é a oferta (nome, preço, condições). PlanHistory abaixo registra cada
// período em que um Subscriber esteve nesse plano — histórico de trocas.
export interface Plan {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
}

export interface PlanHistory {
  id: string
  subscriberId: string
  planId: string
  startDate: string
  endDate: string | null
}