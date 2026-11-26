import type { DiaSemana, ExercicioTreino, Treino } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedTreinos } from './seed'
import { obterAtendimentoPersonalPorAluno, obterAtendimentosPorAluno } from './atendimentoRepository'

const KEY = 'workouts'

export const DIAS_SEMANA: DiaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']

// getDay() do JS começa em domingo (0); converte pro DiaSemana do dia atual.
const DIA_POR_INDICE_JS: DiaSemana[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

export function diaSemanaDeHoje(): DiaSemana {
  return DIA_POR_INDICE_JS[new Date().getDay()]
}

export function inicializarTreinos(): void {
  ensureSeeded<Treino>(KEY, seedTreinos)
}

export function obterTreinos(): Treino[] {
  return readCollection<Treino>(KEY, seedTreinos)
}

export function obterTreinosPorAluno(alunoId: string): Treino[] {
  return obterTreinos().filter((treino) => treino.alunoId === alunoId)
}

export function obterTreinoAtivoPorAluno(alunoId: string): Treino | undefined {
  return obterTreinosPorAluno(alunoId).find((treino) => treino.active)
}

// Salvar um treino ativo desativa os demais do mesmo aluno (só um ativo por vez, preserva historico).
export function salvarTreino(treino: Treino): void {
  const current = obterTreinos()
  const withDeactivated = treino.active
    ? current.map((item) =>
        item.alunoId === treino.alunoId && item.id !== treino.id ? { ...item, active: false } : item,
      )
    : current

  const index = withDeactivated.findIndex((item) => item.id === treino.id)
  if (index === -1) {
    writeCollection(KEY, [...withDeactivated, treino])
  } else {
    const updated = [...withDeactivated]
    updated[index] = treino
    writeCollection(KEY, updated)
  }
}

function criarTreinoVazio(alunoId: string, atendimentoId: string): Treino {
  return {
    id: `workout-${atendimentoId || alunoId}`,
    alunoId,
    atendimentoId,
    recorrente: true,
    week: 1,
    exercises: [],
    startDate: new Date().toISOString().slice(0, 10),
    active: true,
    origin: 'manual',
  }
}

// O treino do aluno fica preso ao Atendimento 'personal' quando ele existe
// (senão ao 'standard') — aluno e, futuramente, o profissional desse vínculo
// editam a mesma grade; cria uma vazia na primeira vez que o aluno acessa.
// Aluno recém-matriculado ainda pode não ter nenhum Atendimento (nenhum
// profissional atribuído): aí a grade fica só dele (atendimentoId vazio) e não
// quebra a tela — quando um vínculo for criado, passa a valer a grade do vínculo.
export function obterTreinoDoAluno(alunoId: string): Treino {
  const atendimentoId =
    obterAtendimentoPersonalPorAluno(alunoId)?.id ??
    obterAtendimentosPorAluno(alunoId).find((item) => item.type === 'standard')?.id ??
    ''

  const existente = obterTreinosPorAluno(alunoId).find(
    (treino) => treino.active && treino.atendimentoId === atendimentoId,
  )
  if (existente) return existente

  const treino = criarTreinoVazio(alunoId, atendimentoId)
  salvarTreino(treino)
  return treino
}

export function agruparExerciciosPorDia(treino: Treino): Record<DiaSemana, ExercicioTreino[]> {
  const grade = DIAS_SEMANA.reduce(
    (acc, dia) => ({ ...acc, [dia]: [] }),
    {} as Record<DiaSemana, ExercicioTreino[]>,
  )
  treino.exercises.forEach((exercicio) => {
    grade[exercicio.diaSemana].push(exercicio)
  })
  return grade
}

export function adicionarExercicioAoTreino(
  treinoId: string,
  exercicioId: string,
  diaSemana: DiaSemana,
  sets: number,
  reps: number,
): void {
  const treino = obterTreinos().find((item) => item.id === treinoId)
  if (!treino) return
  salvarTreino({ ...treino, exercises: [...treino.exercises, { exercicioId, diaSemana, sets, reps }] })
}

export function removerExercicioDoTreino(treinoId: string, exercicioId: string, diaSemana: DiaSemana): void {
  const treino = obterTreinos().find((item) => item.id === treinoId)
  if (!treino) return
  const exercises = treino.exercises.filter(
    (item) => !(item.exercicioId === exercicioId && item.diaSemana === diaSemana),
  )
  salvarTreino({ ...treino, exercises })
}

export function definirRecorrenciaDoTreino(treinoId: string, recorrente: boolean): void {
  const treino = obterTreinos().find((item) => item.id === treinoId)
  if (!treino) return
  salvarTreino({ ...treino, recorrente })
}

export function definirSemanaDoTreino(treinoId: string, week: number): void {
  const treino = obterTreinos().find((item) => item.id === treinoId)
  if (!treino) return
  salvarTreino({ ...treino, week: Math.max(1, week) })
}
