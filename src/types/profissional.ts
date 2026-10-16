// baseType é só a classificação padrão da pessoa — o que importa pro negócio é o
// vínculo em Atendimento (a mesma pessoa pode ser instrutor de um aluno e personal de outro).
export type TipoBaseProfissional = 'instructor' | 'personalTrainer'

export interface Profissional {
  id: string
  name: string
  cpf: string
  phone: string
  birthDate: string
  baseType: TipoBaseProfissional
  specialization: string
  notes: string
}
