# Módulo 4 — Profissional *(já em andamento)*

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Contrato que este módulo consome:** agenda semanal (Módulo 1 — Fundação).
**Contrato que este módulo fornece:** avaliações físicas lançadas aqui alimentam a tela de evolução do aluno (Módulo 6).

## Checklist

- [ ] **RF-PRO-01/02 — Dashboard do profissional, alunos vinculados e agenda**

  **Descrição:** substituir o placeholder de `ProfessionalDashboardPage.tsx` por uma visão dos alunos vinculados ao profissional logado e da própria agenda.

  - **Lista de alunos vinculados** — alunos com `Atendimento` do tipo `'personal'` vinculados a esse profissional (`Atendimento.profissionalId` == profissional logado).
  - **Agenda e atalho pra avaliação física** — mostrar a agenda semanal do profissional (Módulo 1) junto da lista de alunos, e preparar o link pra lançar avaliação física de cada aluno da lista (item abaixo).

  **Onde mexer:**
  - `ProfessionalDashboardPage.tsx` e telas novas na mesma pasta (`src/features/professional/`).
  - Consumir `atendimentoRepository.ts` (filtrar por `profissionalId` + `type: 'personal'`) e a agenda do Módulo 1.

  **Onde NÃO mexer:**
  - Não montar a vitrine de contratação de personal aqui — essa é a visão do aluno `standard` (Módulo 6).
  - Não reimplementar a entidade/edição de agenda — só consumir o que o Módulo 1 fornece.

  **Critério de aceite:**
  - Lista mostra só alunos com `Atendimento.type === 'personal'` e `profissionalId` igual ao do profissional logado — nunca todos os alunos da academia.
  - Cada item da lista tem um link/atalho pra lançar avaliação física daquele aluno.

- [ ] **RF-PRO-03 — Lançamento de avaliação física (principal e mensal)**

  **Descrição:** o profissional lança uma avaliação **principal** (referência, a primeira) e avaliações **mensais** de acompanhamento (frequência/progresso) do mesmo aluno — usando a mesma entidade `AvaliacaoFisica`, diferenciada por um campo de tipo (D19), **sem criar entidade nova**.

  **Entidade (`src/types/avaliacaoFisica.ts`, ajustar):**
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

  **Onde mexer:**
  - `src/types/avaliacaoFisica.ts` — adicionar campo `tipo: 'principal' | 'mensal'` (avisar o grupo antes, é entidade existente).
  - `src/data/avaliacaoFisicaRepository.ts` (já existe — ajustar).
  - Tela nova em `src/features/professional/` pra lançar avaliação de um aluno vinculado.

  **Onde NÃO mexer:**
  - Não criar entidade nova para avaliação (D19) — reaproveitar `AvaliacaoFisica`.
  - Não confundir com `ObjetivoAluno`/`Meta` (conceitos diferentes, ver Módulo 5).

  **Critério de aceite:**
  - Dado que um aluno ainda não tem nenhuma `AvaliacaoFisica`, quando o profissional lança a primeira, então ela é salva com `tipo: 'principal'`.
  - Dado que um aluno já tem avaliação `'principal'`, quando o profissional lança uma nova, então ela é salva com `tipo: 'mensal'`.
  - Só o profissional vinculado ao aluno (via `Atendimento` tipo `personal`) lança avaliação desse aluno.
