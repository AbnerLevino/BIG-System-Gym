// Registro de avaliação física num ponto no tempo; measurements é livre (ex: {peito: 100, braco: 35}),
// por isso é Record<string, number> em vez de campos fixos.
export interface AvaliacaoFisica {
  id: string
  alunoId: string
  objective: string
  description: string
  notes: string
  assessmentDate: string
  weight: number
  measurements: Record<string, number>
  // D19: a primeira do aluno é a 'principal' (referência); as seguintes são 'mensal'.
  tipo: 'principal' | 'mensal'
}
