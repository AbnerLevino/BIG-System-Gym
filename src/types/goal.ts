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