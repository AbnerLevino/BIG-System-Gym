// "Moldura" reaproveitada por toda página logada: recebe o conteúdo da página
// como children e encaixa a Sidebar por cima, sem a página precisar repetir isso.
//
// O <main> reserva espaço só pro tamanho do rail recolhido da Sidebar (64px +
// respiro de 12px = 76px de margem), pra nunca sobrepor o conteúdo em repouso.
// Quando a Sidebar expande (clique no >), ela flutua por cima do <main> como
// overlay — sem empurrar nada, sem reservar espaço extra pra esse estado.
//
// A tela inteira fica travada em 100vh (sem scroll de página) — só o bloco de
// conteúdo rola internamente.
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
    <div className="h-screen overflow-hidden bg-zinc-100 p-6">
      <Sidebar />
      <main className="ml-[76px] h-full overflow-y-auto rounded-2xl border border-zinc-900/10 bg-white p-6">
        {children}
      </main>
    </div>
  )
}
