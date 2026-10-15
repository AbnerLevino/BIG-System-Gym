export type ProfessionalBaseType = 'instructor' | 'personalTrainer'

export interface Professional {
  id: string
  name: string
  cpf: string
  phone: string
  birthDate: string
  baseType: ProfessionalBaseType
  specialization: string
  notes: string
}