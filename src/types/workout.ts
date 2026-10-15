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