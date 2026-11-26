// Campo de busca padrão (lupa + texto), usado nas listas de alunos.
import { Search } from 'lucide-react'

interface CampoBuscaProps {
  valor: string
  onMudar: (valor: string) => void
  placeholder: string
  autoFocus?: boolean
  className?: string
}

export function CampoBusca({ valor, onMudar, placeholder, autoFocus, className }: CampoBuscaProps) {
  return (
    <label
      className={`flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 transition-colors focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/30 ${className ?? ''}`}
    >
      <Search size={16} className="shrink-0 text-slate-400" />
      <input
        autoFocus={autoFocus}
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  )
}
