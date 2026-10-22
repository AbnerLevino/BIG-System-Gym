// Plano é a oferta (nome, preço, condições). HistoricoPlano abaixo registra cada
// período em que um Aluno esteve nesse plano — histórico de trocas.
export type OrigemPlano = 'direct' | 'partner'
export type NomeParceiro = 'totalpass' | 'wellhub'

export interface Plano {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
  origin: OrigemPlano
  partnerName?: NomeParceiro
}

export interface HistoricoPlano {
  id: string
  alunoId: string
  planoId: string
  startDate: string
  endDate: string | null
}
