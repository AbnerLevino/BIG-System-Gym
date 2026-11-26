// Faixa de indicadores da tela inicial: uma caixa só, dividida em colunas.
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function FaixaIndicadores({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Indicadores"
      className="mt-7 grid divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-zinc-50/60 md:grid-cols-3 md:divide-x md:divide-y-0"
    >
      {children}
    </section>
  )
}

interface IndicadorProps {
  icon: LucideIcon
  iconClasses: string
  valor: number
  titulo: string
  contexto: string
}

export function Indicador({ icon: Icone, iconClasses, valor, titulo, contexto }: IndicadorProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}>
        <Icone size={22} />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-semibold leading-none text-slate-900">{valor}</span>
          <span className="text-sm font-semibold text-slate-700">{titulo}</span>
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">{contexto}</p>
      </div>
    </div>
  )
}
