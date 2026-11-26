# Módulo 6 — Aluno: Financeiro e Evolução

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Contrato que este módulo consome:** motor de cobrança + agenda (Módulo 1 — Fundação), avaliação física (Módulo 4 — Profissional).

## Checklist

- [ ] **RF-ALU-09 — Vitrine de personal trainers e contratação**

  **Descrição:** implementar D11/D12: o aluno `standard` (sem personal vinculado) vê uma vitrine com os personal trainers disponíveis na academia e pode contratar um, criando/atualizando o próprio `Atendimento`.

  **Onde mexer:**
  - Telas novas em `src/features/subscriber/`.
  - Consumir `atendimentoRepository.ts` e a agenda do profissional (Módulo 1), pra mostrar disponibilidade na vitrine.

  **Onde NÃO mexer:**
  - Não criar fluxo de pagamento separado pra contratação (D12) — é tudo via o `Pagamento` normal, gerado pelo motor de cobrança (Módulo 1).

  **Critério de aceite:**
  - Dado que o aluno tem `Atendimento.type === 'personal'` já vinculado, quando acessa a tela, então vê só aquele profissional, sem vitrine.
  - Dado que o aluno é `standard`, quando acessa a tela, então vê a vitrine com os personal trainers disponíveis (nome, especialização, agenda).
  - Dado que o aluno contrata um personal, quando confirma, então o `Atendimento` é atualizado (`type: 'personal'`, `profissionalId`, `value`) e nenhum `Pagamento` é criado na hora — o valor só aparece no próximo pagamento gerado automaticamente.

- [ ] **RF-ALU-10 — Visualização da evolução física**

  **Descrição:** tela do aluno pra visualizar a própria evolução a partir das avaliações físicas lançadas pelo profissional (principal + mensais, D19). Path `/aluno/evolucao` (já previsto no `Sidebar.tsx`).

  **Onde mexer:**
  - Tela nova em `src/features/subscriber/`.
  - Consumir `avaliacaoFisicaRepository.ts` filtrando pelo `alunoId` logado.

  **Onde NÃO mexer:**
  - Não criar tela de lançamento de avaliação aqui — isso é do profissional (Módulo 4). Esta tela só lê/exibe.

  **Critério de aceite:**
  - Dado que o aluno tem ao menos uma `AvaliacaoFisica` com `tipo: 'principal'`, quando acessa `/aluno/evolucao`, então vê essa avaliação como referência.
  - Dado que o aluno tem avaliações `tipo: 'mensal'` subsequentes, quando acessa a tela, então vê a evolução (ex: peso, medidas) ao longo do tempo em relação à avaliação principal.
  - Dado que o aluno ainda não tem nenhuma avaliação, quando acessa a tela, então vê mensagem clara (não tela vazia/quebrada).

- [ ] **RF-ALU-11/12/13 — Dashboard geral do aluno e pagamento dentro do app**

  **Descrição:** substituir o placeholder de `SubscriberDashboardPage.tsx` por um resumo geral do aluno, com pagamento resolvível dentro do próprio app.

  - **Resumo do aluno** — mostrar no dashboard (`/aluno`): próximo `Pagamento` (status `pending`/`late`, vindo do Módulo 1), treino do dia (Módulo 5, se já estiver pronto) e meta ativa (`Meta`, se houver).
  - **Pagamento dentro do app** — botão pra pagar o `Pagamento` pendente/atrasado sem saída do app, reaproveitando o mesmo checkout simulado já usado pelo atendente no balcão (`pagamentoService.ts` / componente de checkout) — sem gateway real (D6).
  - **Extrato/histórico** — path `/aluno/financeiro` (já previsto no `Sidebar.tsx`) pra extrato/histórico de pagamentos; `/aluno` fica só com o resumo.

  **Onde mexer:**
  - `SubscriberDashboardPage.tsx`.
  - Reaproveitar `pagamentoService.ts` / componente de checkout já usado pelo atendente — não recriar fluxo de pagamento do zero.

  **Onde NÃO mexer:**
  - Não implementar gateway real nem geração de pagamento aqui — isso é o Módulo 1. Esta task só consome e deixa o aluno pagar o que já foi gerado.

  **Critério de aceite:**
  - Dashboard mostra o próximo `Pagamento` do aluno logado com status correto (`pending`/`late`).
  - Dado que o aluno tem um `Pagamento` `pending` ou `late`, quando clica em pagar, então completa o mesmo checkout simulado do atendente, sem saída do app.
  - `/aluno/financeiro` mostra o histórico de pagamentos do aluno; `/aluno` mostra só o resumo (próximo pagamento, treino do dia, meta ativa).
