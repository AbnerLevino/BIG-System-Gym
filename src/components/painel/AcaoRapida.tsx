// Bloco "Acesso rápido" da tela inicial e cada um dos seus botões.
import type { ReactNode } from 'react'
import { ArrowRight, type LucideIcon } from 'lucide-react'

export function AcessoRapido({ children, colunas = 4 }: { children: ReactNode; colunas?: 3 | 4 }) {
  return (
    <section aria-label="Acesso rápido" className="mt-7">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Acesso rápido</h2>
      <div className={`mt-3 grid gap-3 sm:grid-cols-2 ${colunas === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {children}
      </div>
    </section>
  )
}

interface AcaoRapidaProps {
  icon: LucideIcon
  titulo: string
  descricao: string
  onClick: () => void
  destaque?: boolean
}

export function AcaoRapida({ icon: Icone, titulo, descricao, onClick, destaque }: AcaoRapidaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        destaque
          ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
          : 'border-slate-200 bg-white hover:border-emerald-600/40'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          destaque ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <Icone size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${destaque ? 'text-white' : 'text-slate-900'}`}>{titulo}</p>
        <p className={`mt-0.5 text-xs leading-snug ${destaque ? 'text-emerald-50/90' : 'text-slate-500'}`}>{descricao}</p>
      </div>
      <ArrowRight
        size={16}
        className={`mt-1 shrink-0 transition-transform group-hover:translate-x-0.5 ${
          destaque ? 'text-white/80' : 'text-slate-300 group-hover:text-emerald-700'
        }`}
      />
    </button>
  )
}
