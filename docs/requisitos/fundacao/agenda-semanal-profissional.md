# RF-FUND-03 — Agenda semanal recorrente do profissional

**Módulo:** Fundação (entidade + regra), tela de edição mora em `src/features/professional/`
**Ator:** Profissional (edita a própria agenda) — consumido por Task 10 e Task 12
**Status:** Em design — entidade ainda não existe

## Descrição
Entidade nova de agenda do profissional, em grade **semanal recorrente** (dia da semana + horário de início/fim, repete toda semana), editável somente pelo próprio profissional.

## Regras de negócio (decisões já fechadas — não reabrir)
- **D13:** grade semanal recorrente. Sem bloqueio de data pontual (férias/falta) nesta rodada — fora de escopo.
- **D14:** quem edita a agenda é o próprio profissional, não o admin.

## Onde mexer
- `src/types/agendaProfissional.ts` (novo) — ex: `{ id, profissionalId, diaSemana, horaInicio, horaFim }`.
- Repository novo (`src/data/agendaProfissionalRepository.ts`), seguindo o padrão de `inicializar*`/`obter*`/`salvar*`.
- Tela de edição nova em `src/features/professional/`.
- `src/data/index.ts` — export + registro em `inicializarTodosOsDados()`.

## Critério de aceite
- Profissional logado só edita a própria agenda (`agendaProfissional.profissionalId` precisa corresponder ao `refId` do `Usuario` logado) — travar isso na tela, não confiar em escolha livre de profissional na UI.
- Grade é recorrente: um item de agenda vale pra todas as semanas, sem data específica.
- Não existe campo ou fluxo de bloqueio pontual (férias, falta, data específica) nesta rodada.

## Dependência — bloqueia
Task 10 (`docs/requisitos/profissional/dashboard-alunos-vinculados.md`) e Task 12 (`docs/requisitos/aluno/vitrine-contratacao-personal.md`) leem esta agenda; nenhuma das duas deve reimplementar a entidade ou a edição.
