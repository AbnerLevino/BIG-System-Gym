// Só existe um Workout com active=true por aluno; criar um novo desativa o anterior
// (preserva histórico em vez de sobrescrever).
export interface WorkoutExercise {
  name: string
  sets: number
  reps: number
}

export interface Workout {
  id: string
  subscriberId: string
  assignmentId: string
  week: number
  exercises: WorkoutExercise[]
  startDate: string
  active: boolean
  origin: 'manual' | 'suggested'
}