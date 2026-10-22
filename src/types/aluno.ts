// O aluno/assinante. planoAtualId é a referência direta ao plano atual;
// trocas de plano ficam registradas separado em HistoricoPlano, sem editar isso aqui.
// Status 'trial' = visita teste: nasceu sem plano (planoAtualId null), ainda não é
// assinante. Vira 'active' quando a pessoa volta e escolhe um plano de verdade.
export type StatusAluno = 'trial' | 'active' | 'cancelled'

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
  planoAtualId: string | null
  startDate: string
  status: StatusAluno
  // Preenchidos no primeiro check-in (cadastro do rosto), não no cadastro presencial.
  photoUrl?: string
  faceDescriptor?: number[]
}
