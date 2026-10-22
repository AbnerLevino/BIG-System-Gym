# Decisão: estratégia de piloto antes de qualquer investimento em backend/SaaS

**Data:** 2026-10-22
**Status:** Alinhado — próximo passo é execução (prospecção).

## Contexto

O grupo tem ambição real de SaaS multi-cidade, mas zero clientes pagantes e zero validação externa de que "mais fácil de usar" bate com o que um dono de academia real considera fácil. A pesquisa de mercado em `docs/pesquisa-mercado/perfis-academias-limeira.md` mapeou academias de bairro reais em Limeira como alvo inicial.

## Decisão

1. **Escolher uma academia de bairro (Perfil 1 ou 2) e oferecer o sistema de graça por 1-2 meses.** Prioridade do piloto é aprendizado, não receita.
2. **Objetivo do piloto:** resolver uma dor real e específica do dono (ex: calote de mensalidade esquecida, ficha de papel perdida) a ponto de ele continuar usando por conta própria e recomendar pra outro dono de academia — não só "testar e elogiar".
3. **Escopo do piloto é o fluxo financeiro + check-in primeiro** (cadastro de aluno, matrícula, pagamento, check-in) — não treino/avaliação física de cara. Se o piloto quebrar, quebra numa parte menor do sistema, e o aprendizado vem mais rápido sobre o que realmente importa pro dono.
4. **Só depois do piloto validado** (dono usando por conta própria, disposto a indicar, e com uma resposta real — mesmo que informal — pra "quanto isso valeria pra você") entra investimento em: onboarding self-service pra segunda/terceira academia, billing automático do SaaS, admin de plataforma pra provisionar tenants.

## O que o piloto valida e o que não valida

- **Valida:** se o fluxo funciona na prática (atendente cadastrando no balcão lotado, Face ID vs carteirinha, aluno abrindo o app).
- **Não valida sozinho:** quanto a academia pagaria. Testar de graça não produz esse dado — a pergunta de preço precisa ser feita explicitamente durante o piloto, não assumida a partir do "ele gostou".

## Implicação técnica

"Backend real" pro piloto não precisa ser feature-completo, mas precisa ser confiável o suficiente pra não perder cadastro ou pagamento de aluno real no meio do dia — Postgres de verdade com backup, não uma simulação de `setTimeout`. Numa cidade do porte de Limeira, uma falha visível com um cliente real circula entre outros donos de academia antes do piloto 2 começar.

## Relacionado

- `docs/decisoes/2026-10-22-multi-tenant-desde-o-schema.md`
- `docs/pesquisa-mercado/perfis-academias-limeira.md`
