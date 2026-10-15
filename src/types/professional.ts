// baseType é só a classificação padrão da pessoa — o que importa pro negócio é o
// vínculo em Assignment (a mesma pessoa pode ser instrutor de um aluno e personal de outro).
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