// Situação da matrícula do aluno, em português — mesma aparência na ficha do
// atendente e na do profissional.
import type { StatusAluno } from '../../types'

export const LABEL_SITUACAO_ALUNO: Record<StatusAluno, string> = {
  active: 'Ativa',
  trial: 'Visita teste',
  cancelled: 'Cancelada',
}

const COR_SITUACAO: Record<StatusAluno, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  trial: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500',
}

export function SeloSituacaoAluno({ status }: { status: StatusAluno }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COR_SITUACAO[status]}`}>
      Matrícula {LABEL_SITUACAO_ALUNO[status].toLowerCase()}
    </span>
  )
}
