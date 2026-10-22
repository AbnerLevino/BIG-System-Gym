# Visão Geral — BigGym

> Este documento existe pra duas coisas: (1) qualquer pessoa do grupo, mesmo sem experiência em programação, entender o que é o projeto e onde encaixar o próprio trabalho; (2) poder ser colado inteiro numa IA como contexto. Ele não contém requisito nem regra de negócio detalhada — isso vive em `docs/requisitos/`. Decisões de arquitetura ficam em `docs/decisoes/`. Pesquisa de mercado fica em `docs/pesquisa-mercado/`.

## O que é o sistema

BigGym é um sistema de gestão de academia. Nasceu como trabalho de faculdade (requisito do professor: React, componentes criados do zero, projeto navegável, só front-end — sem banco de dados real), mas a ambição real do grupo é virar um produto SaaS vendido pra academias de bairro/médio porte, começando por Limeira.

Isso muda como o projeto deve ser pensado desde agora: toda decisão de modelagem de dado deve já considerar que, no futuro, vários academias (tenants) vão usar o mesmo sistema, isolados entre si — ver `docs/decisoes/2026-10-22-multi-tenant-desde-o-schema.md`.

Existem quatro tipos de pessoa que usam o sistema:

1. **Admin** — gestor da academia (cadastra planos, profissionais, vê financeiro)
2. **Atendente** — equipe de balcão/recepção (cadastra aluno, faz check-in, recebe pagamento no balcão)
3. **Profissional** — instrutor ou personal trainer (acompanha os alunos vinculados a ele)
4. **Aluno (Subscriber)** — o cliente da academia (vê o próprio treino, pagamento, evolução física)

## Estado atual (front-end puro)

Não existe banco de dados de verdade ainda. Os dados ficam guardados no `localStorage` do navegador, com uma carga inicial de exemplo (seed) — simula um banco pra fins de demonstração. O plano de migração pra backend real (Spring Boot + PostgreSQL) está descrito em `docs/decisoes/`, mas **não começa agora** — a prioridade imediata é validar o produto com uma academia real usando a versão front-end (ver `docs/decisoes/2026-10-22-estrategia-piloto.md`).

## Stack (ferramentas usadas hoje)

- **React** — biblioteca pra construir a interface em componentes
- **Vite** — ferramenta que roda o projeto em desenvolvimento e gera a versão final
- **TypeScript** — JavaScript com tipos (ajuda a evitar erro bobo de "campo errado")
- **Tailwind CSS** — framework de estilo via classes
- **React Router** — navegação entre páginas (rotas)
- **Zustand** — estado global (ex: quem está logado)

## Regra de idioma (importante)

- **Código** (nomes de arquivo, variáveis, funções, tipos) é em **inglês**.
- **Tudo que a pessoa que usa o sistema vê** (textos de tela, URLs, botões) é em **português**.
- Documentação e mensagens de commit no Git: português.

## Como o código está organizado (e por quê)

A ideia central: cada camada só conhece a de baixo, nunca a de cima ou a dos lados.

```
src/types      → o que é cada "coisa" do sistema (aluno, pagamento, plano...)
src/data       → onde os dados são lidos e salvos (hoje: localStorage)
src/store      → quem está logado agora (visível pra todo o app)
src/components → peças de interface reutilizáveis
src/features   → as telas de cada papel (admin, atendente, professional, subscriber...)
src/routes     → o mapa de quais URLs existem e quem pode acessar cada uma
```

### `src/types/` — "o que é cada coisa"
Interface TypeScript por entidade, sem lógica — só a forma do dado. Se uma tarefa precisa de campo novo numa entidade existente, avise o grupo antes de mudar (outro módulo pode já depender do formato atual).

### `src/data/` — "onde os dados vêm e vão"
Um arquivo por entidade (`*Repository.ts`) com funções de leitura/escrita. **Regra de ouro: nenhuma tela lê ou grava dado direto — sempre pelas funções do repository.** Isso é o que torna a futura migração pra backend real um swap de implementação interna, não uma reescrita de tela — ver `docs/decisoes/`.

### `src/store/authStore.ts` — "quem está logado agora"
Zustand guarda o usuário logado e o papel dele. Qualquer componente lê com `useAuthStore(...)`.

### `src/components/common/` e `src/components/layout/`
Peças reutilizáveis (`Button`, `Input`, `Card`, `Table`, `Modal`) e a moldura de página logada (`AppLayout` + `Sidebar`).

### `src/features/{admin, atendente, professional, subscriber, ...}/`
Pasta onde cada papel tem suas telas. **Regra de ouro: a pasta de uma feature nunca importa nada de dentro da pasta de outra feature.** Algo em comum entre papéis sobe pra `components` ou pra uma feature compartilhada (ex: `financial`).

### `src/routes/`
`AppRoutes.tsx` lista todas as páginas e URLs. `ProtectedRoute.tsx` impede acesso fora do papel certo.

## Onde encontrar o resto

- `docs/pesquisa-mercado/` — quem são os clientes-alvo em Limeira, perfis reais pesquisados.
- `docs/decisoes/` — decisões de arquitetura e de estratégia de produto, com o porquê.
- `docs/requisitos/{atendente,aluno,profissional,admin}/` — requisito funcional por funcionalidade, um arquivo por capacidade.
- `docs/aulas/` — explicação dos conceitos de React/TypeScript usados no esqueleto do projeto.
- `docs/superpowers/` — histórico de planos de implementação já executados (como cada feature foi construída, passo a passo).
- `CONTRIBUTING.md` — fluxo de Git (branch e Pull Request).
