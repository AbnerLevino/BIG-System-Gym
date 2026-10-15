// Vínculo aluno-profissional: aqui mora a diferença instrutor/personal (não no cadastro
// da pessoa). value só é usado quando type é 'personal' (serviço cobrado a mais).
export type AssignmentType = 'standard' | 'personal'

export interface Assignment {
  id: string
  subscriberId: string
  professionalId: string
  type: AssignmentType
  value?: number
}