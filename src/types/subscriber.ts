// O aluno/assinante. currentPlanId é a referência direta ao plano atual;
// trocas de plano ficam registradas separado em PlanHistory, sem editar isso aqui.
export interface Subscriber {
  id: string
  fullName: string
  weight: number
  height: number
  phone: string
  cpf: string
  address: string
  birthDate: string
  notes: string
  currentPlanId: string
  startDate: string
}