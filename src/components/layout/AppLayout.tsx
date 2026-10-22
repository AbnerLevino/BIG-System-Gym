// "Moldura" reaproveitada por toda página logada: recebe o conteúdo da página
// como children e encaixa a Sidebar ao lado, sem a página precisar repetir isso.
//
// A tela inteira fica travada em 100vh (sem scroll de página) — só o bloco de
// conteúdo rola internamente, mantendo sidebar e página num fluxo visual único.
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)

  if (!usuarioAtual) return null

  return (
    <div className="flex h-screen gap-6 overflow-hidden bg-zinc-100 p-6">
      <Sidebar />
      <main className="flex-1 overflow-y-auto rounded-2xl bg-white p-6">{children}</main>
    </div>
  )
}
