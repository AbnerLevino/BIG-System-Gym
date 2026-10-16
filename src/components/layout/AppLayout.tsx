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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={usuarioAtual.role} />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <span className="text-sm text-slate-600">{usuarioAtual.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
