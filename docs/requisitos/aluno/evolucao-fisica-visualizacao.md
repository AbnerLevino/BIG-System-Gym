# RF-ALU-10 — Visualização da evolução física

**Módulo:** Aluno
**Ator:** Aluno
**Status:** Em design — depende de `docs/requisitos/profissional/lancamento-avaliacao-fisica.md` (RF-PRO-03)

## Descrição
Tela do aluno pra visualizar a própria evolução a partir das avaliações físicas lançadas pelo profissional (principal + mensais, D19). Path `/aluno/evolucao` (já previsto no `Sidebar.tsx`).

## Depende de
- `docs/requisitos/profissional/lancamento-avaliacao-fisica.md` (é o profissional quem gera o dado consumido aqui).

## Onde mexer
- Tela nova em `src/features/subscriber/`.
- Consumir `avaliacaoFisicaRepository.ts` filtrando pelo `alunoId` logado.

## Onde NÃO mexer
- Não criar tela de lançamento de avaliação aqui — isso é do profissional (RF-PRO-03). Esta tela só lê/exibe.

## Critério de aceite
- Dado que o aluno tem ao menos uma `AvaliacaoFisica` com `tipo: 'principal'`, quando acessa `/aluno/evolucao`, então vê essa avaliação como referência.
- Dado que o aluno tem avaliações `tipo: 'mensal'` subsequentes, quando acessa a tela, então vê a evolução (ex: peso, medidas) ao longo do tempo em relação à avaliação principal.
- Dado que o aluno ainda não tem nenhuma avaliação, quando acessa a tela, então vê mensagem clara (não tela vazia/quebrada).
