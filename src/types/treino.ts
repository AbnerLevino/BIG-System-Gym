// Só existe um Treino com active=true por atendimento; criar um novo desativa o
// anterior (preserva histórico em vez de sobrescrever).
export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'

export interface ExercicioTreino {
  exercicioId: string
  diaSemana: DiaSemana
  sets: number
  reps: number
}

export interface Treino {
  id: string
  alunoId: string
  atendimentoId: string
  // true (padrão) = a mesma grade (dia -> exercícios) vale toda semana; false = a
  // grade é específica da semana indicada em `week`.
  recorrente: boolean
  week: number
  exercises: ExercicioTreino[]
  startDate: string
  active: boolean
  origin: 'manual' | 'suggested'
}
