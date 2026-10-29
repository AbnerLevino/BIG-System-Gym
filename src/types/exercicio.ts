export type GrupoMuscular = 'peito' | 'costas' | 'ombro' | 'braco' | 'abdomen' | 'perna'

export type NivelDificuldadeExercicio = 'iniciante' | 'intermediario' | 'avancado'

export interface Exercicio {
  id: string
  nome: string
  descricao: string
  grupoMuscular: GrupoMuscular
  nivelDificuldade: NivelDificuldadeExercicio
  equipamento: string
  videoUrl?: string
  animacaoUrl?: string
}
