// Visão do profissional (Central do profissional): os alunos com vínculo personal
// com ele, a situação das avaliações físicas de cada um e a agenda de hoje.
// Regra de "Atenção necessária" (combinada com o grupo nesta rodada):
//   - aluno sem nenhuma avaliação -> precisa da avaliação principal (prioridade alta);
//   - última avaliação há mais de DIAS_PARA_NOVA_AVALIACAO dias -> mensal pendente (média).
import type { AgendaProfissional, Aluno, AvaliacaoFisica } from '../types'
import { obterAlunoPorId } from './alunoRepository'
import { obterAtendimentosPorProfissional } from './atendimentoRepository'
import { obterAvaliacoesPorAluno } from './avaliacaoFisicaRepository'
import { obterAgendaPorProfissional } from './agendaProfissionalRepository'
import { diaSemanaDeHoje } from './treinoRepository'
import { dataLocalISO } from './recepcaoService'

export const DIAS_PARA_NOVA_AVALIACAO = 30

export type SituacaoAvaliacao = 'semAvaliacao' | 'vencida' | 'emDia'

export interface AlunoDoProfissional {
  aluno: Aluno
  // Mais recente primeiro.
  avaliacoes: AvaliacaoFisica[]
  ultima?: AvaliacaoFisica
  diasDesdeUltima?: number
  situacao: SituacaoAvaliacao
}

function diasEntre(dataISO: string, hojeISO: string): number {
  const umDia = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(`${hojeISO}T12:00:00`) - Date.parse(`${dataISO}T12:00:00`)) / umDia)
}

export function profissionalAtendeAluno(profissionalId: string, alunoId: string): boolean {
  return obterAtendimentosPorProfissional(profissionalId).some(
    (atendimento) => atendimento.type === 'personal' && atendimento.alunoId === alunoId,
  )
}

export function obterSituacaoDoAluno(aluno: Aluno): AlunoDoProfissional {
  const avaliacoes = obterAvaliacoesPorAluno(aluno.id)
  const ultima = avaliacoes[0]
  if (!ultima) return { aluno, avaliacoes, situacao: 'semAvaliacao' }
  const diasDesdeUltima = diasEntre(ultima.assessmentDate, dataLocalISO())
  return {
    aluno,
    avaliacoes,
    ultima,
    diasDesdeUltima,
    situacao: diasDesdeUltima > DIAS_PARA_NOVA_AVALIACAO ? 'vencida' : 'emDia',
  }
}

// Alunos com vínculo personal ativo com o profissional (cancelados ficam de fora), por nome.
export function obterAlunosDoProfissional(profissionalId: string): AlunoDoProfissional[] {
  const ids = new Set(
    obterAtendimentosPorProfissional(profissionalId)
      .filter((atendimento) => atendimento.type === 'personal')
      .map((atendimento) => atendimento.alunoId),
  )
  return [...ids]
    .map((id) => obterAlunoPorId(id))
    .filter((aluno): aluno is Aluno => aluno !== undefined && aluno.status !== 'cancelled')
    .map(obterSituacaoDoAluno)
    .sort((a, b) => a.aluno.fullName.localeCompare(b.aluno.fullName))
}

export interface ResumoProfissional {
  alunos: AlunoDoProfissional[]
  // Sem avaliação primeiro; depois as vencidas há mais tempo.
  atencao: AlunoDoProfissional[]
  avaliacoesNoMes: number
  grade: AgendaProfissional[]
  horariosHoje: AgendaProfissional[]
}

export function obterResumoProfissional(profissionalId: string): ResumoProfissional {
  const alunos = obterAlunosDoProfissional(profissionalId)
  const mesAtual = dataLocalISO().slice(0, 7)
  const grade = obterAgendaPorProfissional(profissionalId)
  const hoje = diaSemanaDeHoje()

  const peso = (item: AlunoDoProfissional) => (item.situacao === 'semAvaliacao' ? Infinity : (item.diasDesdeUltima ?? 0))
  const atencao = alunos.filter((item) => item.situacao !== 'emDia').sort((a, b) => peso(b) - peso(a))

  return {
    alunos,
    atencao,
    avaliacoesNoMes: alunos.reduce(
      (total, item) => total + item.avaliacoes.filter((avaliacao) => avaliacao.assessmentDate.startsWith(mesAtual)).length,
      0,
    ),
    grade,
    horariosHoje: grade.filter((item) => item.diaSemana === hoje),
  }
}
