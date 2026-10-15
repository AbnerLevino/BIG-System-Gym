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