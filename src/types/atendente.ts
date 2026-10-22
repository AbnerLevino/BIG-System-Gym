// Atendente é uma entidade de negócio (igual Profissional), cadastrada pelo Admin —
// não é só um login. Usuario.refId do papel 'atendente' aponta pra um registro aqui.
export interface Atendente {
  id: string
  name: string
  cpf: string
  phone: string
  cargo: string
  photoUrl?: string
}
