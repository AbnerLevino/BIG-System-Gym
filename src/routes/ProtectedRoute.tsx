// "Guarda" de rota: não desenha UI própria, só decide se deixa passar pro
// conteúdo real ou redireciona. Implementa a regra do spec: acesso fora do
// papel do usuário volta pro próprio dashboard, em vez de mostrar a tela errada.
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { PapelUsuario } from '../types'

const ROLE_HOME: Record<PapelUsuario, string> = {
  admin: '/admin',
  professional: '/profissional',
  subscriber: '/aluno',
}

interface ProtectedRouteProps {
  allowedRole: PapelUsuario
  children: ReactNode
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)

  if (!usuarioAtual) {
    return <Navigate to="/login" replace />
  }

  if (usuarioAtual.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[usuarioAtual.role]} replace />
  }

  return <>{children}</>
}
