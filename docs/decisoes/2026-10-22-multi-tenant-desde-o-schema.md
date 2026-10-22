# Decisão: multi-tenant desde o schema, não como Fase 2

**Data:** 2026-10-22
**Status:** Alinhado — ainda não implementado (não existe backend ainda).

## Contexto

O plano original tratava multi-tenant (vários academias usando o mesmo sistema, isoladas entre si) como "Fase 2", a ser resolvida só depois de o sistema de gestão de uma academia estar pronto. Isso deixou de fazer sentido no momento em que o objetivo do grupo virou explicitamente vender BigGym como SaaS pra várias academias, não só construir um sistema pra uma academia.

## Decisão

Quando o backend real (Spring Boot + PostgreSQL) começar a ser construído, toda tabela de negócio nasce com `academia_id` como campo obrigatório desde a primeira migration do Flyway — não é algo adicionado depois.

Escopo da regra:
- Toda entidade de negócio (Aluno, Plano, Profissional, Treino, Meta, AvaliacaoFisica, Pagamento, Atendimento, CheckIn, Usuario) carrega `academia_id` com FK pra `Academia`, `NOT NULL`.
- Entidade de catálogo verdadeiramente global (se existir — ex: lista-base de exercícios, caso não seja customizável por academia) pode não carregar `academia_id`. Qualquer exceção dessas precisa ser decidida caso a caso, não por padrão.
- Isolamento em duas camadas: (1) toda query do backend filtra por `academia_id` do usuário autenticado; (2) Row-Level Security do PostgreSQL como segunda trava (`USING (academia_id = current_setting('app.tenant')::uuid)`), pra um bug de query não conseguir vazar dado de uma academia pra outra sozinho.

## Por que agora e não depois

Custo de fazer isso na primeira migration: quase zero — é só um campo extra em cada tabela, desde o início. Custo de fazer depois, com dado real de cliente pagante já em produção: migração de schema + backfill de dado existente + risco real de vazamento de dado entre academias durante a transição. A assimetria de custo é grande o suficiente pra decidir isso antes de qualquer linha de backend ser escrita.

## O que isso NÃO significa

Não significa mexer no front-end/localStorage agora. A camada atual de `localStorage` é descartada quando o backend nascer — não faz sentido resolver isolamento multi-tenant numa camada que está sendo substituída. A disciplina de `academia_id` entra no dia em que a primeira migration do Postgres for escrita, não antes.

## Relacionado

- `docs/decisoes/2026-10-22-estrategia-piloto.md` — o piloto roda com 1 academia, então multi-tenant não é testado na prática ainda; é preparação de schema pra quando a segunda academia entrar.
