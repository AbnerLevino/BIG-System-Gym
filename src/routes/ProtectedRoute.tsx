// "Guarda" de rota: não desenha UI própria, só decide se deixa passar pro
// conteúdo real ou redireciona. Implementa a regra do spec: acesso fora do
// papel do usuário volta pro próprio dashboard, em vez de mostrar a tela errada.
import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore, usuarioTemAcessoLiberado } from '../store/authStore'
import type { PapelUsuario } from '../types'

const ROLE_HOME: Record<PapelUsuario, string> = {
  admin: '/admin',
  atendente: '/atendente',
  professional: '/profissional',
  subscriber: '/aluno',
}

interface ProtectedRouteProps {
  allowedRole: PapelUsuario
  children: ReactNode
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const logout = useAuthStore((state) => state.logout)
  // Sessão aberta antes do cancelamento também perde o acesso (RF-ATD-11).
  const acessoBloqueado = usuarioAtual !== null && !usuarioTemAcessoLiberado(usuarioAtual)

  useEffect(() => {
    if (acessoBloqueado) logout()
  }, [acessoBloqueado, logout])

  if (!usuarioAtual || acessoBloqueado) {
    return <Navigate to="/login" replace />
  }

  if (usuarioAtual.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[usuarioAtual.role]} replace />
  }

  return <>{children}</>
}
