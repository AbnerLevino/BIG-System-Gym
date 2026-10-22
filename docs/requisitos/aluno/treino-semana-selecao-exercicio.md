# RF-ALU-02/03/04/05 — Treino: visualização por dia da semana e seleção de exercício

**Módulo:** Aluno
**Ator:** Aluno
**Status:** Em design — modelo de dado atual (`Treino`) não suporta isso ainda (ver nota técnica)

## Descrição
O aluno deve conseguir:
1. Visualizar os dias da semana (incluindo finais de semana) com o exercício selecionado para cada dia.
2. Listar exercícios disponíveis, filtrados por grupo muscular.
3. Visualizar o detalhe de um exercício: nome, descrição, nível de dificuldade, vídeo-aula.
4. Selecionar um exercício e associá-lo a um dia específico da semana.

## Critério de aceite
- Dado que o aluno está vendo o detalhe de um exercício, quando seleciona um dia da semana, então o exercício passa a aparecer no treino daquele dia.

## Nota técnica — gap real no modelo de dado atual
O `Treino` hoje (`src/types/treino.ts`) é uma lista plana de exercícios por semana (`{name, sets, reps}`), sem campo de dia da semana, grupo muscular, dificuldade ou vídeo, e é criado pelo `Atendimento` (profissional), não pelo aluno. Esse requisito exige extensão real do modelo antes de implementar — não é só tela nova.

## Questão aberta — decisão de negócio pendente
**O aluno escolhe livremente qualquer exercício pra qualquer dia, ou escolhe dentro de uma grade pré-montada por um profissional?** Isso muda a modelagem: se houver grade, o `Treino` continua pertencendo ao profissional e o aluno só seleciona dentro do que foi liberado; se for livre, o aluno passa a ser autor do próprio treino. Ver também `docs/requisitos/profissional/treino-criacao-profissional.md`, que hoje assume que é o profissional quem monta o treino — esse requisito precisa ser reconciliado com aquele antes de implementar.
