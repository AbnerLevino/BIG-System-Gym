// "Moldura" reaproveitada por toda página logada: recebe o conteúdo da página
// como children e encaixa Sidebar + topbar em volta, sem a página precisar repetir isso.
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Sidebar } from './Sidebar'
import { Button } from '../common'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!usuarioAtual) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <Sidebar role={usuarioAtual.role} />
      <div>
        <header>
          <span>{usuarioAtual.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
