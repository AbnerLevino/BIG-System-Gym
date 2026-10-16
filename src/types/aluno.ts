// O aluno/assinante. planoAtualId é a referência direta ao plano atual;
// trocas de plano ficam registradas separado em HistoricoPlano, sem editar isso aqui.
export interface Aluno {
  id: string
  fullName: string
  weight: number
  height: number
  phone: string
  cpf: string
  address: string
  birthDate: string
  notes: string
  planoAtualId: string
  startDate: string
}
