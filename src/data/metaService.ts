// Status da Meta (ajuste do RF-ALU-06/07/08). Com personal acompanhando
// (profissionalId preenchido), vale o status que o personal registra. Sem personal,
// o sistema calcula sozinho a cada leitura (nada é gravado):
//   - frequência: check-ins liberados do aluno vs. alvo;
//   - peso: peso da AvaliacaoFisica mais recente vs. alvo (a direção — perder ou
//     ganhar — vem de comparar o alvo com o peso de partida do aluno);
//   - medida: sem regra automática definida → fica como está.
import type { GrupoMuscular, Meta, NivelDificuldadeExercicio, ObjetivoAluno, StatusMeta, TipoMeta, TipoObjetivo } from '../types'
import { obterAlunoPorId } from './alunoRepository'
import { obterAvaliacoesPorAluno } from './avaliacaoFisicaRepository'
import { obterCheckinsPorAluno } from './checkinRepository'
import { obterMetasPorAluno, salvarMeta } from './metaRepository'
import { obterObjetivoDoAluno, salvarObjetivoAluno } from './objetivoAlunoRepository'

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface ProgressoMeta {
  status: StatusMeta
  // Valor atual medido (check-ins ou kg), quando o sistema consegue medir.
  valorAtual?: number
}

export function calcularProgressoMeta(meta: Meta): ProgressoMeta {
  if (meta.profissionalId) return { status: meta.status }

  const prazoPassou = hojeISO() > meta.deadline
  const statusPorPrazo = (atingiu: boolean): StatusMeta => (atingiu ? 'completed' : prazoPassou ? 'late' : 'inProgress')

  if (meta.type === 'frequency') {
    const checkins = obterCheckinsPorAluno(meta.alunoId).filter((checkin) => checkin.accessGranted).length
    return { status: statusPorPrazo(checkins >= meta.targetValue), valorAtual: checkins }
  }

  if (meta.type === 'weight') {
    const avaliacoes = [...obterAvaliacoesPorAluno(meta.alunoId)].sort((a, b) =>
      a.assessmentDate.localeCompare(b.assessmentDate),
    )
    const aluno = obterAlunoPorId(meta.alunoId)
    const pesoAtual = avaliacoes[avaliacoes.length - 1]?.weight ?? aluno?.weight
    const pesoInicial = avaliacoes[0]?.weight ?? aluno?.weight
    if (!pesoAtual || !pesoInicial) return { status: meta.status }
    const querPerder = meta.targetValue < pesoInicial
    const atingiu = querPerder ? pesoAtual <= meta.targetValue : pesoAtual >= meta.targetValue
    return { status: statusPorPrazo(atingiu), valorAtual: pesoAtual }
  }

  return { status: meta.status }
}

// Meta em andamento do aluno, já com o status calculado.
export function obterMetaAtivaDoAluno(alunoId: string): { meta: Meta; progresso: ProgressoMeta } | undefined {
  return obterMetasPorAluno(alunoId)
    .map((meta) => ({ meta, progresso: calcularProgressoMeta(meta) }))
    .filter(({ progresso }) => progresso.status === 'inProgress')
    .sort((a, b) => a.meta.deadline.localeCompare(b.meta.deadline))[0]
}

export interface RespostasQuestionario {
  objetivo: TipoObjetivo
  nivelExperiencia: NivelDificuldadeExercicio
  gruposMusculares: GrupoMuscular[]
  meta: { description: string; type: TipoMeta; targetValue: number; deadline: string }
}

// RF-ALU-06/07: grava o questionário e a meta definida pelo aluno. Refazer o
// questionário atualiza a meta que o próprio aluno tinha criado antes (sem
// personal), em vez de empilhar metas; meta acompanhada por personal não é tocada.
export function responderQuestionarioObjetivos(alunoId: string, respostas: RespostasQuestionario): ObjetivoAluno {
  const anterior = obterObjetivoDoAluno(alunoId)
  const metaAnterior = anterior?.metaId ? obterMetasPorAluno(alunoId).find((meta) => meta.id === anterior.metaId) : undefined
  const reaproveitarMeta = metaAnterior !== undefined && !metaAnterior.profissionalId

  const meta: Meta = {
    id: reaproveitarMeta ? metaAnterior!.id : crypto.randomUUID(),
    alunoId,
    ...respostas.meta,
    status: 'inProgress',
  }
  salvarMeta(meta)

  const objetivo: ObjetivoAluno = {
    id: crypto.randomUUID(),
    alunoId,
    objetivo: respostas.objetivo,
    nivelExperiencia: respostas.nivelExperiencia,
    gruposMusculares: respostas.gruposMusculares,
    metaId: meta.id,
    respondidoEm: new Date().toISOString(),
  }
  salvarObjetivoAluno(objetivo)
  return objetivo
}
