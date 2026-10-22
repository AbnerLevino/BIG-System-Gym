# Criação/edição de treino pelo profissional

**Módulo:** Profissional
**Ator:** Profissional
**Status:** Já implementado (simulado) — **em possível conflito com nova feature do aluno, ver nota**

## Descrição
O profissional cria/edita o treino semanal do aluno vinculado a ele (`Atendimento`).

## Regras de negócio
- Só existe um `Treino` com `active = true` por aluno por vez; criar um novo desativa o anterior (preserva histórico, não sobrescreve).
- `origin: 'manual' | 'suggested'` — hoje `suggested` é reservado pro motor de recomendação futuro (fora de escopo da fase atual).

## Conflito a resolver
`docs/requisitos/aluno/treino-semana-selecao-exercicio.md` descreve o aluno escolhendo o próprio exercício por dia da semana — isso pode substituir, complementar ou conviver com este requisito, dependendo da resposta à questão aberta registrada naquele arquivo (treino livre vs. grade montada pelo profissional). Não implementar nenhum dos dois sem resolver essa questão primeiro.
