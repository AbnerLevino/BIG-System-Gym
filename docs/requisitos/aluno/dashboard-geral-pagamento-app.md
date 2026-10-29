# RF-ALU-11/12/13 — Dashboard geral do aluno e pagamento dentro do app

**Módulo:** Aluno
**Ator:** Aluno
**Status:** Em design — `SubscriberDashboardPage.tsx` é placeholder; depende de `docs/requisitos/fundacao/motor-cobranca-inadimplencia.md` (RF-FUND-02)

## Descrição
Implementar D7: substituir o placeholder de `SubscriberDashboardPage.tsx` por um resumo geral do aluno, com pagamento resolvível dentro do próprio app.

## RF-ALU-11 — Resumo do aluno
Mostrar no dashboard (`/aluno`): próximo `Pagamento` (status `pending`/`late`, vindo de RF-FUND-02), treino do dia (se `docs/requisitos/aluno/treino-semana-selecao-exercicio.md` já estiver pronto) e meta ativa (`Meta`, se houver).

## RF-ALU-12 — Pagamento dentro do app
Botão pra pagar o `Pagamento` pendente/atrasado sem saída do app, reaproveitando o mesmo checkout simulado já usado pelo atendente no balcão (`pagamentoService.ts` / componente de checkout) — sem gateway real (D6).

## RF-ALU-13 — Extrato/histórico
Path `/aluno/financeiro` (já previsto no `Sidebar.tsx`) pra extrato/histórico de pagamentos; `/aluno` fica só com o resumo.

## Onde mexer
- `SubscriberDashboardPage.tsx`.
- Reaproveitar `pagamentoService.ts` / componente de checkout já usado pelo atendente — não recriar fluxo de pagamento do zero.

## Onde NÃO mexer
- Não implementar gateway real nem geração de pagamento aqui — isso é RF-FUND-02. Esta task só consome e deixa o aluno pagar o que já foi gerado.

## Critério de aceite
- Dashboard mostra o próximo `Pagamento` do aluno logado com status correto (`pending`/`late`).
- Dado que o aluno tem um `Pagamento` `pending` ou `late`, quando clica em pagar, então completa o mesmo checkout simulado do atendente, sem saída do app.
- `/aluno/financeiro` mostra o histórico de pagamentos do aluno; `/aluno` mostra só o resumo (próximo pagamento, treino do dia, meta ativa).
