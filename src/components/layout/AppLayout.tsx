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
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!currentUser) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <Sidebar role={currentUser.role} />
      <div>
        <header>
          <span>{currentUser.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
