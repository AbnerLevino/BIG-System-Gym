# RF-ALU-09 — Vitrine de personal trainers e contratação

**Módulo:** Aluno
**Ator:** Aluno (`standard`)
**Status:** Em design — depende de `docs/requisitos/fundacao/agenda-semanal-profissional.md` (RF-FUND-03)

## Descrição
Implementar D11/D12: o aluno `standard` (sem personal vinculado) vê uma vitrine com os personal trainers disponíveis na academia e pode contratar um, criando/atualizando o próprio `Atendimento`.

## Regras de negócio (decisões já fechadas — não reabrir)
- **D11:** aluno com `Atendimento` tipo `'personal'` já vinculado → vê só aquele profissional (não vê a vitrine). Aluno `standard` → vê a vitrine.
- **D12:** contratar um personal atualiza o `Atendimento` do aluno (`type: 'personal'`, `profissionalId`, `value`). O valor extra entra no **próximo** `Pagamento` automático (RF-FUND-02), junto da mensalidade — **não é cobrança separada**, o personal é "da academia".

## Onde mexer
- Telas novas em `src/features/subscriber/`.
- Consumir `atendimentoRepository.ts` e a agenda do profissional (RF-FUND-03), pra mostrar disponibilidade na vitrine.

## Onde NÃO mexer
- Não criar fluxo de pagamento separado pra contratação (D12) — é tudo via o `Pagamento` normal, gerado pelo motor de cobrança (RF-FUND-02).

## Critério de aceite
- Dado que o aluno tem `Atendimento.type === 'personal'` já vinculado, quando acessa a tela, então vê só aquele profissional, sem vitrine.
- Dado que o aluno é `standard`, quando acessa a tela, então vê a vitrine com os personal trainers disponíveis (nome, especialização, agenda).
- Dado que o aluno contrata um personal, quando confirma, então o `Atendimento` é atualizado (`type: 'personal'`, `profissionalId`, `value`) e nenhum `Pagamento` é criado na hora — o valor só aparece no próximo pagamento gerado automaticamente.
