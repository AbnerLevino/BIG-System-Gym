# RF-ADM-04/05/06/07 — Dashboard financeiro do admin

**Módulo:** Admin
**Ator:** Admin
**Status:** Em design — `AdminDashboardPage.tsx` é placeholder; depende de `docs/requisitos/fundacao/motor-cobranca-inadimplencia.md` (RF-FUND-02) já estar pronto

## Descrição
Substituir o placeholder de `AdminDashboardPage.tsx` por uma visão financeira e operacional da academia. Path `/admin` (já existe) ou `/admin/financeiro` (já previsto no `Sidebar.tsx`) — decidir com o grupo se divide em duas telas ou uma só.

## RF-ADM-04 — Receita do mês por competência
Receita contada no mês do `dueDate` de cada `Pagamento` (D3), não no mês em que foi de fato pago.

## RF-ADM-05 — Lista de inadimplentes
Lista de alunos com `Pagamento` em `status: 'late'`, mostrando quantos dias cada um está em atraso (D4).

## RF-ADM-06 — Alunos ativos
Contagem/lista de alunos com `status: 'active'` (`src/types/aluno.ts`).

## RF-ADM-07 — Aniversariantes do mês
Lista de alunos com `birthDate` no mês atual.

## Onde mexer
- `src/features/admin/AdminDashboardPage.tsx`.
- Possivelmente `src/features/financial/` pra lógica de agregação compartilhável entre admin e aluno (`docs/requisitos/aluno/dashboard-geral-pagamento-app.md` também consome dados financeiros, mas da perspectiva do próprio aluno).

## Onde NÃO mexer
- Não implementar geração ou cálculo de `Pagamento`/inadimplência aqui — isso é `docs/requisitos/fundacao/motor-cobranca-inadimplencia.md` (RF-FUND-02). Esta task **só consome** o resultado.

## Critério de aceite
- Receita exibida no mês X soma `originalValue`/`paidValue` de todo `Pagamento` com `dueDate` em X, independente de quando foi pago.
- Lista de inadimplentes mostra, por aluno, quantos dias de atraso (hoje − `dueDate`), só para `status: 'late'`.
- Nenhum cálculo de geração de pagamento ou de carência é refeito aqui — tudo lido do motor (RF-FUND-02).
