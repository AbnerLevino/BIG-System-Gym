// Questionário de objetivos respondido pelo PRÓPRIO aluno (RF-ALU-06/07/08).
// Não confundir com AvaliacaoFisica (medidas corporais lançadas pelo profissional)
// nem com Meta (alvo numérico com prazo — a meta definida aqui é gravada como Meta).
import type { GrupoMuscular, NivelDificuldadeExercicio } from './exercicio'

export type TipoObjetivo = 'perderPeso' | 'ganharMassa' | 'condicionamento' | 'saude'

export interface ObjetivoAluno {
  id: string
  alunoId: string
  objetivo: TipoObjetivo
  // Nível de experiência do aluno — limita a dificuldade dos exercícios recomendados.
  nivelExperiencia: NivelDificuldadeExercicio
  gruposMusculares: GrupoMuscular[]
  metaId?: string
  respondidoEm: string
}
