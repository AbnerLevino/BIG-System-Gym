// Motor de recomendação do RF-ALU-08 — regra combinada com o grupo:
//   1. pega os exercícios de TODOS os grupos musculares escolhidos (união);
//   2. não repete exercício (dedup por id);
//   3. limita pela experiência do aluno: iniciante → só iniciante;
//      intermediário → iniciante + intermediário; avançado → todos.
// O objetivo (perder peso, ganhar massa…) não filtra exercício — o catálogo não
// tem essa informação; ele fica registrado e orienta a meta.
import type { Exercicio, GrupoMuscular, NivelDificuldadeExercicio } from '../types'
import { obterExerciciosPorGrupoMuscular } from './exercicioRepository'

const ORDEM_NIVEL: Record<NivelDificuldadeExercicio, number> = {
  iniciante: 0,
  intermediario: 1,
  avancado: 2,
}

export function recomendarExercicios(
  grupos: GrupoMuscular[],
  nivelExperiencia: NivelDificuldadeExercicio,
): Exercicio[] {
  const limite = ORDEM_NIVEL[nivelExperiencia]
  const porId = new Map<string, Exercicio>()

  grupos.forEach((grupo) => {
    obterExerciciosPorGrupoMuscular(grupo)
      .filter((exercicio) => ORDEM_NIVEL[exercicio.nivelDificuldade] <= limite)
      .forEach((exercicio) => porId.set(exercicio.id, exercicio))
  })

  return [...porId.values()].sort(
    (a, b) =>
      grupos.indexOf(a.grupoMuscular) - grupos.indexOf(b.grupoMuscular) ||
      ORDEM_NIVEL[a.nivelDificuldade] - ORDEM_NIVEL[b.nivelDificuldade] ||
      a.nome.localeCompare(b.nome),
  )
}
