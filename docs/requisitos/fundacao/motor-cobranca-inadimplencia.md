# RF-FUND-02 — Motor de cobrança automática e inadimplência

**Módulo:** Fundação (regra de negócio, sem tela própria)
**Ator:** Sistema — consumido por Atendente (`AttendantCheckinPage.tsx`), Admin (`docs/requisitos/distribuicao/dashboard-financeiro.md`) e Aluno (`docs/requisitos/aluno/dashboard-geral-pagamento-app.md`)
**Status:** Em design — `Pagamento` já tem `dueDate`/`status`/`lateFee` no type, mas a geração automática não existe (só a aprovação simulada em `pagamentoService.ts`)

## Descrição
Motor que gera `Pagamento` automaticamente a cada virada de ciclo mensal do `Atendimento`/`Plano` ativo de um aluno, e calcula/atualiza o `status` desse pagamento ao longo do tempo, aplicando a regra de carência e bloqueio por inadimplência.

## Regras de negócio (decisões já fechadas — não reabrir)
- **D1 — Congelamento de preço:** aumentar `Plano.price` só afeta `Pagamento` gerado a partir daquele momento. A geração sempre lê o `Plano.price` **vigente no momento da geração**; nunca recalcula um `Pagamento` já existente (`Pagamento.originalValue` é congelado por registro).
- **D2:** sem conceito de plano "descontinuado".
- **D3 — Competência:** receita conta no mês do `dueDate` (vencimento), não no mês em que foi efetivamente pago.
- **D4 — Inadimplência:** vencimento sem pagamento → carência de **5 dias corridos** → a partir do 6º dia sem pagamento, check-in/catraca bloqueado.
- **D5 — Sem multa:** `Pagamento.lateFee` existe no type mas não é usado por regra nenhuma; não implementar cálculo de multa.
- **D7 — Cobrança do personal:** se o `Atendimento` do aluno for `type: 'personal'`, o `Atendimento.value` entra somado no `Pagamento` gerado, junto da mensalidade — não é uma cobrança separada.

## Onde mexer
- `src/data/pagamentoService.ts` ou um novo `src/data/cobrancaService.ts`.
- `AttendantCheckinPage.tsx` — só consumir a função de verificação (a mensagem `latePayment` já existe reservada, sem uso).

## Onde NÃO mexer
- `processarPagamento` (já funciona, fluxo de aprovação simulada não muda).
- Não implementar cálculo de `lateFee` (D5).

## Critério de aceite
- Dado que o ciclo mensal do `Atendimento`/`Plano` ativo vira, quando o motor roda, então um novo `Pagamento` é criado com `originalValue` = `Plano.price` vigente (+ `Atendimento.value` se `type: 'personal'`) e `status: 'pending'`.
- Dado que um `Pagamento` passa de `dueDate` + 5 dias corridos sem `paidValue`, quando o motor avalia o status, então `status` vira `'late'`.
- Função exposta (ex: `alunoEstaInadimplente(alunoId)`) retorna `true` a partir do 6º dia sem pagamento, para ser consumida por `AttendantCheckinPage.tsx` no bloqueio de check-in.
- Alterar `Plano.price` depois de um `Pagamento` já gerado não altera o `originalValue` desse pagamento.
- Nenhuma cobrança extra (multa) é gerada por atraso.

## Dependência — bloqueia
Task 9 (`docs/requisitos/distribuicao/dashboard-financeiro.md`) e Task 14 (`docs/requisitos/aluno/dashboard-geral-pagamento-app.md`) consomem este motor; ambas só devem ler o resultado, nunca reimplementar geração/cálculo de pagamento.
