// Contrato de autenticação: quem loga, com qual papel, e refId aponta pro registro
// de negócio correspondente (Profissional ou Aluno).
export type PapelUsuario = 'admin' | 'atendente' | 'professional' | 'subscriber'

export interface Usuario {
  id: string
  nome: string
  email: string
  password: string
  role: PapelUsuario
  refId: string
}
