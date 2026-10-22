# Gestão de planos (incluindo parceiro)

**Módulo:** Admin
**Ator:** Admin
**Status:** Já implementado (simulado)

## Descrição
Admin cria e gerencia planos da academia, incluindo planos oferecidos via parceiro (TotalPass/Wellhub).

## Regras de negócio
- `Plano.origin === 'partner'` exige `partnerName` (`totalpass` | `wellhub`).
- Quando `origin === 'partner'`, o `Pagamento` desse aluno nasce automaticamente com `status: 'paid'` e `paymentMethod: 'partner'` — simula o parceiro repassando o valor pra academia por fora, sem cobrança direta do aluno. Não há chamada de API externa real; é regra de geração de pagamento diferente da padrão.
