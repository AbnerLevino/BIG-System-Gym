# Módulo 3 — Admin

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Contrato que este módulo consome:** cálculo de receita/inadimplência vem do motor de cobrança (Módulo 1) — este módulo só lê o resultado, nunca recalcula.

## Checklist

- [ ] **RF-ADM-01 — Gestão de planos**

  **Descrição:** tela de listagem, criação e edição de `Plano`, em `/admin/planos` (path já previsto no `Sidebar.tsx`).

  **Entidade (`src/types/plano.ts`, já definida):**
  ```ts
  export type OrigemPlano = 'direct' | 'partner'
  export type NomeParceiro = 'totalpass' | 'wellhub'

  export interface Plano {
    id: string
    name: string
    price: number
    modalities: string[]
    conditions: string
    origin: OrigemPlano
    partnerName?: NomeParceiro
  }
  ```

  **Onde mexer:**
  - `src/features/admin/` (telas novas de listagem/criação/edição).
  - Consumir `planoRepository.ts` (já existe) — não recriar persistência.

  **Onde NÃO mexer:**
  - Não criar conceito de plano "descontinuado" (D2) — sem campo ou status de inativação.
  - Não implementar lógica de congelamento de preço aqui — isso é garantido pelo motor de cobrança (D1, Módulo 1); esta tela só precisa confirmar visualmente que mudar o preço não altera pagamento já gerado.

  **Critério de aceite:**
  - Dado que um `Plano` tem `origin: 'partner'`, quando cadastrado/editado, então `partnerName` é obrigatório e restrito a `'totalpass' | 'wellhub'`.
  - Dado que um `Plano` existente tem seu `price` alterado, quando a alteração é salva, então nenhum `Pagamento` já gerado é modificado.
  - Listagem reflete os planos cadastrados via `planoRepository.ts` — sem lista mockada na própria tela.

- [ ] **RF-ADM-02 — Cadastro e gestão de funcionários (RH)**

  **Descrição:** estender `Atendente` e `Profissional` com os campos de RH (D9) e criar telas de cadastro/edição/listagem em `/admin/profissionais` (path já previsto no `Sidebar.tsx`) — incluindo também a gestão de atendentes, ou numa sub-rota equivalente a decidir com o grupo.

  **Onde mexer:**
  - `src/types/atendente.ts` — hoje só `{ id, name, cpf, phone, cargo, photoUrl? }`; adicionar os campos de RH (D9).
  - `src/types/profissional.ts` — hoje só `{ id, name, cpf, phone, birthDate, baseType, specialization, notes }`; adicionar os campos de RH + `cref?: string`.
  - `src/data/atendenteRepository.ts` e `src/data/profissionalRepository.ts` (já existem — ajustar pro novo formato).
  - Telas novas em `src/features/admin/`.

  **Onde NÃO mexer:**
  - **Fora de escopo nesta rodada (D10):** não criar módulo de contas a pagar (salário + despesas da academia). Esta rodada cobre só o cadastro de dados do funcionário.

  **Critério de aceite:**
  - Cadastro de `Atendente`/`Profissional` exige todos os campos de RH listados em D9, exceto CREF que é opcional e só aparece em `Profissional`.
  - Como `Atendente` e `Profissional` já são entidades existentes, avisar o grupo antes de alterar o formato.
  - Nenhuma tela desta task cria ou edita lançamento financeiro de salário/despesa.

- [ ] **RF-ADM-04/05/06/07 — Dashboard financeiro do admin**

  **Descrição:** substituir o placeholder de `AdminDashboardPage.tsx` por uma visão financeira e operacional da academia. Path `/admin` (já existe) ou `/admin/financeiro` (já previsto no `Sidebar.tsx`) — decidir com o grupo se divide em duas telas ou uma só.

  - **Receita do mês por competência** — receita contada no mês do `dueDate` de cada `Pagamento` (D3), não no mês em que foi de fato pago.
  - **Lista de inadimplentes** — alunos com `Pagamento` em `status: 'late'`, mostrando quantos dias cada um está em atraso (D4).
  - **Alunos ativos** — contagem/lista de alunos com `status: 'active'` (`src/types/aluno.ts`).
  - **Aniversariantes do mês** — lista de alunos com `birthDate` no mês atual.

  **Onde mexer:**
  - `src/features/admin/AdminDashboardPage.tsx`.
  - Possivelmente `src/features/financial/` pra lógica de agregação compartilhável (o Módulo 6 — dashboard do aluno — também consome dado financeiro, mas da perspectiva do próprio aluno).

  **Onde NÃO mexer:**
  - Não implementar geração ou cálculo de `Pagamento`/inadimplência aqui — isso é o Módulo 1 (motor de cobrança). Esta task **só consome** o resultado.

  **Critério de aceite:**
  - Receita exibida no mês X soma `originalValue`/`paidValue` de todo `Pagamento` com `dueDate` em X, independente de quando foi pago.
  - Lista de inadimplentes mostra, por aluno, quantos dias de atraso (hoje − `dueDate`), só para `status: 'late'`.
  - Nenhum cálculo de geração de pagamento ou de carência é refeito aqui — tudo lido do motor (Módulo 1).
