// Contrato de autenticação: quem loga, com qual papel, e refId aponta pro registro
// de negócio correspondente (Professional ou Subscriber).
export type UserRole = 'admin' | 'professional' | 'subscriber'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  refId: string
}