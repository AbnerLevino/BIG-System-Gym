# Geração de pagamento e cálculo do financeiro

**Módulo:** Admin
**Ator:** Sistema (automático) / Atendente (lançamento no balcão)
**Status:** Já implementado (simulado)

## Descrição
`Pagamento` é gerado automaticamente a partir do plano vigente do aluno — nunca lançado manualmente pelo Admin, exceto o pagamento recebido no balcão pelo Atendente (`docs/requisitos/atendente/pagamento-balcao.md`).

## Regras de negócio
- Fluxo: `pending` → `paid` (ou `late` se passar da `dueDate`, com `lateFee` calculado).
- Pagamento aprovado gera recibo em PDF com numeração sequencial.
- `Financeiro` é um agregado mensal **sempre calculado**, nunca digitado — soma de receitas e soma de atrasados (inadimplência) a partir dos registros de `Pagamento` do mês.
- Nenhuma integração real de gateway de pagamento ainda — simulação para na fronteira do "processamento" (delay artificial + aprova sempre, ou recusa aleatória pra exercitar tratamento de erro).

## Relacionado
- `docs/decisoes/2026-10-22-estrategia-piloto.md` — no piloto real, essa confiabilidade precisa subir de "simulado" pra "real, com backup", mesmo sem gateway de pagamento de produção ainda.
