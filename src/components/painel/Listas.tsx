// Peças de lista usadas nas telas do atendente e do profissional: linha de aluno
// (com barra de prioridade opcional, selo e ação), estado vazio, abas e a linha
// "rótulo — valor" das fichas.
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Aluno } from '../../types'
import { AvatarAluno } from '../aluno'

export interface SeloItem {
  label: string
  classes: string
}

interface ItemAlunoProps {
  aluno?: Pick<Aluno, 'fullName' | 'photoUrl' | 'status'>
  nome: string
  descricao: string
  descricaoClasses?: string
  selo?: SeloItem
  // Classe de cor da barrinha lateral (ex: 'bg-rose-500'); sem ela, a linha não tem barra.
  barra?: string
  acao?: { label: string; onClick: () => void }
  onAbrir: () => void
}

export function ItemAluno({ aluno, nome, descricao, descricaoClasses, selo, barra, acao, onAbrir }: ItemAlunoProps) {
  return (
    <li
      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white py-3 pr-3 ${barra ? 'pl-5' : 'pl-3'}`}
    >
      {barra ? <span className={`absolute inset-y-0 left-0 w-1 ${barra}`} aria-hidden /> : null}
      {aluno ? <AvatarAluno aluno={aluno} tamanho="sm" /> : null}
      <button type="button" onClick={onAbrir} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 hover:text-emerald-700">{nome}</p>
          {selo ? (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${selo.classes}`}>{selo.label}</span>
          ) : null}
        </div>
        <p className={`mt-0.5 truncate text-xs ${descricaoClasses ?? 'text-slate-500'}`}>{descricao}</p>
      </button>
      {acao ? (
        <button
          type="button"
          onClick={acao.onClick}
          className="hidden shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-700 hover:text-emerald-700 sm:inline-flex"
        >
          {acao.label}
        </button>
      ) : null}
      <button type="button" onClick={onAbrir} aria-label={`Abrir ficha de ${nome}`}>
        <ChevronRight size={16} className="text-slate-300 hover:text-emerald-700" />
      </button>
    </li>
  )
}

export function EstadoVazio({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">{titulo}</p>
      <p className="mt-1 text-xs text-slate-500">{descricao}</p>
    </div>
  )
}

interface AbasProps<T extends string> {
  abas: { id: T; label: string }[]
  ativa: T
  onTrocar: (id: T) => void
}

export function Abas<T extends string>({ abas, ativa, onTrocar }: AbasProps<T>) {
  return (
    <div className="flex rounded-full bg-zinc-100 p-1 text-xs font-semibold">
      {abas.map((aba) => (
        <button
          key={aba.id}
          type="button"
          onClick={() => onTrocar(aba.id)}
          aria-pressed={ativa === aba.id}
          className={`rounded-full px-3 py-1 transition-colors ${
            ativa === aba.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {aba.label}
        </button>
      ))}
    </div>
  )
}

export function Linha({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{valor}</span>
    </div>
  )
}

export function formatarDataBr(data: string | null | undefined): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}
