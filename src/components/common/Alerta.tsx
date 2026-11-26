// Mensagem de retorno padrão (erro, sucesso, aviso ou informação) — mesma caixa em
// todas as telas, em vez de texto colorido solto.
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type TipoAlerta = 'erro' | 'sucesso' | 'aviso' | 'info'

const ESTILO: Record<TipoAlerta, { classes: string; icone: typeof Info }> = {
  erro: { classes: 'border-rose-200 bg-rose-50 text-rose-700', icone: XCircle },
  sucesso: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-800', icone: CheckCircle2 },
  aviso: { classes: 'border-amber-200 bg-amber-50 text-amber-800', icone: AlertTriangle },
  info: { classes: 'border-slate-200 bg-zinc-50 text-slate-700', icone: Info },
}

interface AlertaProps {
  tipo: TipoAlerta
  children: ReactNode
  className?: string
  id?: string
}

export function Alerta({ tipo, children, className, id }: AlertaProps) {
  const { classes, icone: Icone } = ESTILO[tipo]
  return (
    <div
      id={id}
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm ${classes} ${className ?? ''}`}
    >
      <Icone size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
