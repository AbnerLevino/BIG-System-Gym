// "Guarda" de rota: não desenha UI própria, só decide se deixa passar pro
// conteúdo real ou redireciona. Implementa a regra do spec: acesso fora do
// papel do usuário volta pro próprio dashboard, em vez de mostrar a tela errada.
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  professional: '/profissional',
  subscriber: '/aluno',
}

interface ProtectedRouteProps {
  allowedRole: UserRole
  children: ReactNode
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />
  }

  return <>{children}</>
}
