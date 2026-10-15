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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar role={currentUser.role} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <span className="text-sm text-slate-400">{currentUser.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
