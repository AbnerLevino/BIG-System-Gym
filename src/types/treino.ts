// Só existe um Treino com active=true por aluno; criar um novo desativa o anterior
// (preserva histórico em vez de sobrescrever).
export interface ExercicioTreino {
  name: string
  sets: number
  reps: number
}

export interface Treino {
  id: string
  alunoId: string
  atendimentoId: string
  week: number
  exercises: ExercicioTreino[]
  startDate: string
  active: boolean
  origin: 'manual' | 'suggested'
}
