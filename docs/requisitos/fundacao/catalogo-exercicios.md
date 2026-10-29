# RF-FUND-01 — Catálogo de exercícios

**Módulo:** Fundação (camada de dado, sem tela própria)
**Ator:** Sistema — consumido por Aluno (`docs/requisitos/aluno/treino-semana-selecao-exercicio.md`) e por Task 4 (objetivo e recomendação)
**Status:** Em design — só `src/types/exercicio.ts` existe; repository e seed faltam

## Descrição
Criar o catálogo de exercícios que ainda não existe de fato: hoje `Treino.exercises` é só `{name, sets, reps}`, sem grupo muscular, dificuldade, descrição ou vídeo/animação. O catálogo é "o que existe pra escolher"; `Treino` é "o que foi escolhido pra esse aluno, nesse dia" — **não confundir os dois conceitos.**

## Entidade (já definida em `src/types/exercicio.ts`)
```ts
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
```

## Onde mexer
- `src/data/exercicioRepository.ts` (novo) — seguir o padrão de repository: `inicializarExercicios()`, `obterExercicios()`, `obterExercicioPorId(id)`, `obterExerciciosPorGrupoMuscular(grupo)`.
- `src/data/seed.ts` — seed de exemplo cobrindo os 6 valores de `GrupoMuscular`.
- `src/data/index.ts` — export do novo repository + registro de `inicializarExercicios()` dentro de `inicializarTodosOsDados()`.
- `src/features/subscriber/SubscriberTreinoPage.tsx` — trocar o array mockado (`exerciciosMock`) por dados vindos de `obterExercicios()`.

## Onde NÃO mexer
- `src/types/treino.ts` — fica pra Task 3/RF-ALU-02..05, não é escopo desta task.

## Critério de aceite
- `exercicioRepository.ts` segue exatamente o padrão dos outros repositories (ver `planoRepository.ts` como referência).
- Seed cobre pelo menos um exercício por `GrupoMuscular` (peito, costas, ombro, braco, abdomen, perna).
- `animacaoUrl`/`videoUrl` guardam só a URL (ex: [ExerciseDB](https://exercisedb.dev/)) — não implementar geração ou upload de animação nesta task.
- `SubscriberTreinoPage.tsx` deixa de depender do array mockado e passa a ler do repository.

## Dependência — bloqueia
Task 3 (`docs/requisitos/aluno/treino-semana-selecao-exercicio.md`) e Task 4 (`docs/requisitos/aluno/avaliacao-fisica-objetivos-recomendacao.md`) consomem este catálogo.

## Coordenação
`grupoMuscular` já é um enum fechado (`GrupoMuscular`) — quem implementar Task 3 e Task 4 reaproveita esse mesmo tipo, não cria um formato próprio de grupo muscular em paralelo.
