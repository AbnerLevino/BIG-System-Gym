export type UserRole = 'admin' | 'professional' | 'subscriber'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  refId: string
}