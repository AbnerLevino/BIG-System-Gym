# RF-ATD-02 — Cadastro de matrícula (vínculo com plano)

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Já implementado (simulado, localStorage)

## Descrição
O atendente deve vincular o aluno a um plano, com data de início de matrícula.

## Depende de
- `cadastro-dados-pessoais.md`

## Critério de aceite
- Só é possível vincular a um plano ativo na academia (plano inativo não aparece na lista).
- Data de início não pode ser anterior à data atual.
- Ao salvar, o status do aluno passa de `trial` para `active`.

## Regras de negócio relacionadas
- Aluno tem um `planoAtualId` direto; trocas de plano ao longo do tempo ficam em `HistoricoPlano`, sem reescrever o histórico financeiro retroativamente.
- Quando o plano é via parceiro (TotalPass/Wellhub), o pagamento desse aluno nasce automaticamente como pago — ver `docs/requisitos/admin/financeiro-calculo-pagamento-regras.md`.
