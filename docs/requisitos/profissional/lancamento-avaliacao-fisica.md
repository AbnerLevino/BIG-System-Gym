# RF-PRO-03 — Lançamento de avaliação física (principal e mensal)

**Módulo:** Profissional
**Ator:** Profissional — contraparte do aluno em `docs/requisitos/aluno/evolucao-fisica-visualizacao.md`
**Status:** Em design — `AvaliacaoFisica` já existe, falta o campo de tipo (D19)

## Descrição
Implementar D19: o profissional lança uma avaliação **principal** (referência, a primeira) e avaliações **mensais** de acompanhamento (frequência/progresso) do mesmo aluno — usando a mesma entidade `AvaliacaoFisica`, diferenciada por um campo de tipo, **sem criar entidade nova** (mesma lógica que já levou a não duplicar `Meta`/`ObjetivoAluno` — ver `docs/requisitos/aluno/avaliacao-fisica-objetivos-recomendacao.md`).

## Entidade (ajustar `src/types/avaliacaoFisica.ts`)
```ts
export interface AvaliacaoFisica {
  id: string
  alunoId: string
  objective: string
  description: string
  notes: string
  assessmentDate: string
  weight: number
  measurements: Record<string, number>
  tipo: 'principal' | 'mensal' // campo novo — D19
}
```

## Onde mexer
- `src/types/avaliacaoFisica.ts` — adicionar campo `tipo: 'principal' | 'mensal'` (avisar o grupo antes, é entidade existente).
- `src/data/avaliacaoFisicaRepository.ts` (já existe — ajustar).
- Tela nova em `src/features/professional/` pra lançar avaliação (de um aluno vinculado, ver `docs/requisitos/profissional/dashboard-alunos-vinculados.md`).

## Onde NÃO mexer
- Não criar entidade nova para avaliação (D19) — reaproveitar `AvaliacaoFisica`.
- Não confundir com `ObjetivoAluno`/`Meta` (conceitos diferentes, ver RF-ALU-06/07/08).

## Critério de aceite
- Dado que um aluno ainda não tem nenhuma `AvaliacaoFisica`, quando o profissional lança a primeira, então ela é salva com `tipo: 'principal'`.
- Dado que um aluno já tem avaliação `'principal'`, quando o profissional lança uma nova, então ela é salva com `tipo: 'mensal'`.
- Só o profissional vinculado ao aluno (via `Atendimento` tipo `personal`) lança avaliação desse aluno.

## Dependência
Alimenta `docs/requisitos/aluno/evolucao-fisica-visualizacao.md`, onde o aluno visualiza a própria evolução a partir destas avaliações.
