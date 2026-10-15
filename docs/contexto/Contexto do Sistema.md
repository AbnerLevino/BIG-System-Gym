# Contexto do Sistema — BigGym

> Este documento existe pra duas coisas: (1) qualquer pessoa do grupo, mesmo sem experiência em programação, entender o que é o projeto e onde encaixar o próprio trabalho; (2) poder ser colado inteiro numa IA (ChatGPT, Claude, Copilot) como contexto, pra ela entender o sistema e ajudar você na sua parte.

## O que é o sistema

BigGym é um sistema de gestão de academia, feito como trabalho de faculdade (requisito: React, componentes criados do zero, projeto navegável, só front-end — sem banco de dados real). Existem três tipos de pessoa que usam o sistema:

1. **Admin** — gestor da academia (cadastra alunos, planos, profissionais, vê financeiro)
2. **Profissional** — instrutor ou personal trainer (acompanha os alunos vinculados a ele)
3. **Aluno (Subscriber)** — o cliente da academia (vê o próprio treino, pagamento, evolução física)

Não existe banco de dados de verdade. Os dados ficam guardados no `localStorage` do navegador, com uma carga inicial de exemplo (seed) — simula um banco pra fins de demonstração.

## Stack (ferramentas usadas)

- **React** — biblioteca pra construir a interface em componentes
- **Vite** — ferramenta que roda o projeto em desenvolvimento e gera a versão final
- **TypeScript** — JavaScript com tipos (ajuda a evitar erro bobo de "campo errado")
- **Tailwind CSS** — framework de estilo via classes (ex: `className="p-4"`) — **hoje está instalado mas sem nenhum estilo aplicado ainda**, o visual será desenhado a partir daqui
- **React Router** — biblioteca de navegação entre páginas (rotas)
- **Zustand** — biblioteca pequena pra guardar estado que várias partes do app precisam ler (ex: quem está logado)

## Regra de idioma (importante)

- **Código** (nomes de arquivo, variáveis, funções, tipos) é em **inglês**.
- **Tudo que a pessoa que usa o sistema vê** (textos de tela, URLs, botões) é em **português**.
- Documentação e mensagens de commit no Git: português.

## Como o código está organizado (e por quê)

A ideia central: cada camada só conhece a de baixo, nunca a de cima ou a dos lados. Isso existe pra que cada pessoa do grupo trabalhe na própria parte sem travar no trabalho dos outros.

```
src/types      → o que é cada "coisa" do sistema (aluno, pagamento, plano...)
src/data       → onde os dados são lidos e salvos (hoje: localStorage)
src/store      → quem está logado agora (visível pra todo o app)
src/components → peças de interface reutilizáveis
src/features   → as telas de cada papel (admin, professional, subscriber...)
src/routes     → o mapa de quais URLs existem e quem pode acessar cada uma
```

### `src/types/` — "o que é cada coisa"
Cada arquivo aqui descreve o formato de uma entidade do sistema: `Subscriber` (aluno), `Payment` (pagamento), `Plan` (plano), `Professional`, `Goal` (meta), `Workout` (treino), etc. **Não tem lógica aqui, só a forma do dado** (quais campos existem e de que tipo). Se sua tarefa precisa de um campo que não existe ainda num tipo, é aqui que se adiciona — mas avise antes de mudar um tipo já em uso por outra pessoa.

### `src/data/` — "onde os dados vêm e vão"
Pra cada entidade existe um arquivo (`subscriberRepository.ts`, `paymentRepository.ts`, etc) com funções como `getSubscribers()` (busca todos), `getSubscriberById(id)` (busca um), `saveSubscriber(dado)` (salva). **Regra importante: nunca leia ou grave dado direto numa tela — sempre chame essas funções.** Isso existe porque, se um dia trocarem `localStorage` por um banco real, só esses arquivos mudam, as telas não precisam saber a diferença.

### `src/store/authStore.ts` — "quem está logado agora"
Guarda o usuário logado e o papel dele (admin/professional/subscriber). Qualquer componente pode perguntar "quem está logado?" chamando `useAuthStore(...)`. Você não precisa editar esse arquivo pra usar — só ler (exemplo vem mais abaixo).

### `src/components/common/` — peças reutilizáveis de interface
`Button`, `Input`, `Card`, `Table`, `Modal`. São blocos genéricos sem estilo definido ainda e sem regra de negócio — só recebem informação (props) e desenham. Use essas peças nas suas telas em vez de criar um botão novo do zero. Hoje elas estão **propositalmente sem design** (sem cor, sem espaçamento bonito) — o visual vai ser desenhado a partir da tela de login, e dali pode se espalhar pros outros componentes.

### `src/components/layout/` — moldura das páginas logadas
`AppLayout` (menu lateral + topo + espaço pro conteúdo) e `Sidebar` (menu que muda de acordo com o papel). Toda página logada usa `<AppLayout>{sua página aqui}</AppLayout>` por fora.

### `src/features/{admin, professional, subscriber, financial, auth}/` — onde cada telas vive
Essa é a pasta onde cada pessoa do grupo trabalha. **Regra de ouro: a pasta de uma feature nunca importa nada de dentro da pasta de outra feature.** Se `admin` e `subscriber` precisam de algo em comum (ex: mostrar o mesmo cartão de pagamento), esse "algo em comum" sobe pra `components` ou pra `financial` (que é a feature de pagamento/financeiro, usada tanto por Admin quanto por Aluno).

### `src/routes/` — o mapa de URLs
`AppRoutes.tsx` lista todas as páginas que existem e qual URL leva a cada uma. `ProtectedRoute.tsx` impede que um Aluno acesse uma URL do Admin (redireciona de volta pro dashboard certo).

## Como fazer o que foi pedido pra você

Passo a passo geral pra qualquer tarefa nova:

1. Veja no `docs/specs/2026-10-15-biggym-gestao-academia-design.md` qual é a regra de negócio da sua parte (ex: regras de Pagamento, de Meta, etc).
2. Confira em `src/types/` se a entidade que você precisa já existe (ex: `Payment`, `Goal`). Se precisar de um campo novo, avise antes de adicionar.
3. Use as funções de `src/data/` pra buscar/salvar o dado — não acesse `localStorage` direto.
4. Monte sua tela dentro da **sua** pasta em `src/features/...`, usando os componentes de `src/components/common` (`Button`, `Input`, `Card`, `Table`) pra desenhar.
5. Se sua tela precisa saber quem está logado, leia com `useAuthStore((state) => state.currentUser)`.
6. Se sua tela é uma página nova (uma URL nova), adicione ela em `src/routes/AppRoutes.tsx`, protegida pelo papel certo.
7. Siga o fluxo de Git do `CONTRIBUTING.md` (criar branch, commitar, abrir Pull Request) — nunca trabalhe direto no `main`.

## Estado atual do projeto

- Esqueleto completo e funcional: login (com atalhos de demonstração), rotas protegidas por papel, dashboards de cada papel (ainda vazios, só um título e um texto de placeholder).
- **Visual ainda não existe de propósito.** Todo componente e página está sem estilo (HTML puro) — o design vai ser construído a partir da tela de login pra frente.
- Camada de dados (`types` + `data`) já cobre: usuário, academia, profissional, aluno, plano, vínculo aluno-profissional, treino, meta, avaliação física, pagamento e financeiro.

## Onde encontrar mais detalhes

- `docs/specs/2026-10-15-biggym-gestao-academia-design.md` — regras de negócio completas de cada entidade.
- `docs/superpowers/plans/2026-10-15-biggym-skeleton.md` — como o esqueleto foi construído, passo a passo.
- `docs/aulas/2026-10-15-conceitos-esqueleto.md` — explicação dos conceitos de React/TypeScript usados em cada arquivo.
- `CONTRIBUTING.md` — fluxo de Git (branch e Pull Request).
