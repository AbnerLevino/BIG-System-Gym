export type AssignmentType = 'standard' | 'personal'

export interface Assignment {
  id: string
  subscriberId: string
  professionalId: string
  type: AssignmentType
  value?: number
}