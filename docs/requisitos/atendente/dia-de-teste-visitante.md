# Dia de teste — registro de Visitante

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Já implementado (simulado, localStorage)

## Descrição
O atendente deve conseguir registrar um Visitante (nome, telefone, data da visita) pra quem está testando a academia antes de se matricular.

## Regras de negócio relacionadas
- Visitante **não é** um Aluno: não tem plano, não gera pagamento, não aparece nas métricas de alunos ativos.
- Se decidir se matricular depois, o atendente usa o fluxo normal de cadastro (`cadastro-dados-pessoais.md`); o registro de Visitante fica só como histórico de quem já visitou.
