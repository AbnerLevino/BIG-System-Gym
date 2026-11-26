// Meta vale pra qualquer aluno, com ou sem personal (ajuste do RF-ALU-06/07/08).
// profissionalId só existe quando um personal acompanha ativamente a meta; sem
// personal, o status é calculado pelo sistema (ver metaService.ts).
export type TipoMeta = 'weight' | 'measurement' | 'frequency'
export type StatusMeta = 'inProgress' | 'completed' | 'late'

export interface Meta {
  id: string
  alunoId: string
  profissionalId?: string
  description: string
  type: TipoMeta
  targetValue: number
  deadline: string
  status: StatusMeta
}
