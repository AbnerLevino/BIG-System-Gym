// Metas só existem pra alunos com vínculo 'personal' ativo (regra de negócio, não
// imposta pelo tipo aqui — quem cria a Meta tem que checar isso antes).
export type TipoMeta = 'weight' | 'measurement' | 'frequency'
export type StatusMeta = 'inProgress' | 'completed' | 'late'

export interface Meta {
  id: string
  alunoId: string
  profissionalId: string
  description: string
  type: TipoMeta
  targetValue: number
  deadline: string
  status: StatusMeta
}
