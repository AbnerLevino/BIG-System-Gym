# RF-PRO-01/02 — Dashboard do profissional e alunos vinculados

**Módulo:** Profissional
**Ator:** Profissional
**Status:** Em design — `ProfessionalDashboardPage.tsx` é placeholder; depende de `docs/requisitos/fundacao/agenda-semanal-profissional.md` (RF-FUND-03)

## Descrição
Substituir o placeholder de `ProfessionalDashboardPage.tsx` por uma visão dos alunos vinculados ao profissional logado e da própria agenda.

## RF-PRO-01 — Lista de alunos vinculados
Lista dos alunos com `Atendimento` do tipo `'personal'` vinculados a esse profissional (D11 — `Atendimento.profissionalId` == profissional logado).

## RF-PRO-02 — Agenda e atalho pra avaliação física
Mostrar a agenda semanal do profissional (RF-FUND-03) junto da lista de alunos, e preparar o link pra lançar avaliação física (`docs/requisitos/profissional/lancamento-avaliacao-fisica.md`) de cada aluno da lista.

## Onde mexer
- `ProfessionalDashboardPage.tsx` e telas novas na mesma pasta (`src/features/professional/`).
- Consumir `atendimentoRepository.ts` (filtrar por `profissionalId` + `type: 'personal'`) e a agenda de RF-FUND-03.

## Onde NÃO mexer
- Não montar a vitrine de contratação de personal aqui — essa é a visão do aluno `standard` (`docs/requisitos/aluno/vitrine-contratacao-personal.md`).
- Não reimplementar a entidade/edição de agenda — só consumir RF-FUND-03.

## Critério de aceite
- Lista mostra só alunos com `Atendimento.type === 'personal'` e `profissionalId` igual ao do profissional logado — nunca todos os alunos da academia.
- Cada item da lista tem um link/atalho pra lançar avaliação física daquele aluno (RF-PRO-03).
