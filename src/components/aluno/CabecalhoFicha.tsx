// Topo das fichas de aluno (atendente e profissional): foto/iniciais, nome, situação
// da matrícula e, à direita, as ações daquela ficha.
import type { ReactNode } from 'react'
import type { Aluno } from '../../types'
import { AvatarAluno } from './AvatarAluno'
import { SeloSituacaoAluno } from './SeloSituacaoAluno'

interface CabecalhoFichaProps {
  aluno: Aluno
  acoes?: ReactNode
}

export function CabecalhoFicha({ aluno, acoes }: CabecalhoFichaProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AvatarAluno aluno={aluno} tamanho="lg" />
        <div>
          <p className="font-heading text-xl font-semibold text-slate-900">{aluno.fullName}</p>
          <div className="mt-1">
            <SeloSituacaoAluno status={aluno.status} />
          </div>
        </div>
      </div>
      {acoes ? <div className="flex flex-wrap gap-2">{acoes}</div> : null}
    </div>
  )
}
