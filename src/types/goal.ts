// Metas só existem pra alunos com vínculo 'personal' ativo (regra de negócio, não
// imposta pelo tipo aqui — quem cria a Goal tem que checar isso antes).
export type GoalType = 'weight' | 'measurement' | 'frequency'
export type GoalStatus = 'inProgress' | 'completed' | 'late'

export interface Goal {
  id: string
  subscriberId: string
  professionalId: string
  description: string
  type: GoalType
  targetValue: number
  deadline: string
  status: GoalStatus
}