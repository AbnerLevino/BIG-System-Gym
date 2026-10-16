// Plano é a oferta (nome, preço, condições). HistoricoPlano abaixo registra cada
// período em que um Aluno esteve nesse plano — histórico de trocas.
export interface Plano {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
}

export interface HistoricoPlano {
  id: string
  alunoId: string
  planoId: string
  startDate: string
  endDate: string | null
}
