export interface PhysicalAssessment {
  id: string
  subscriberId: string
  objective: string
  description: string
  notes: string
  assessmentDate: string
  weight: number
  measurements: Record<string, number>
}