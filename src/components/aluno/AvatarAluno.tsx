// Foto do Face ID quando existe; senão, as iniciais do aluno.
import type { Aluno } from '../../types'

const TAMANHOS = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

interface AvatarAlunoProps {
  aluno: Pick<Aluno, 'fullName' | 'photoUrl' | 'status'>
  tamanho?: keyof typeof TAMANHOS
}

export function AvatarAluno({ aluno, tamanho = 'md' }: AvatarAlunoProps) {
  if (aluno.photoUrl) {
    return <img src={aluno.photoUrl} alt="" className={`${TAMANHOS[tamanho]} shrink-0 rounded-full object-cover`} />
  }
  const cancelado = aluno.status === 'cancelled'
  return (
    <span
      className={`flex ${TAMANHOS[tamanho]} shrink-0 items-center justify-center rounded-full font-bold ${
        cancelado ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700'
      }`}
    >
      {iniciais(aluno.fullName)}
    </span>
  )
}
