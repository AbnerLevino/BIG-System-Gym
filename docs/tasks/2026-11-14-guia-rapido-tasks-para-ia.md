# BigGym — Guia rápido de tasks (pra colar direto na IA)

**Escopo reduzido em 2026-11-15:** eram 14 tasks antes; o grupo decidiu fechar uma história curta (que já estava quase pronta) e dar uma tela simples pro admin e pro profissional, em vez de deixar 14 telas pela metade pra uma apresentação de 10 minutos. A versão completa anterior continua no arquivo `2026-10-26-distribuicao-tasks-equipe-completa.md` e no histórico do Git, se o grupo quiser retomar depois da disciplina.

## Como usar (3 passos)

1. Abra uma conversa nova com a IA e cole o bloco **CONTEXTO MESTRE** abaixo, sozinho, sem mais nada.
2. Depois que a IA responder, cole o bloco da **sua task** (só a sua, não as outras).
3. Peça pra implementar. No final, roda `npm run dev`, olha no navegador se ficou certo, e só então avisa o grupo que terminou.

Se a IA sugerir mudar alguma regra, criar algo diferente do que o bloco pede, ou "simplificar" alguma coisa fora do que foi pedido — não aceita, pede pra ela seguir exatamente o que está escrito.

## Índice — qual task pegar

| Task | O que é | Depende de |
|---|---|---|
| 1 | Fechar a história principal (commit + teste de ponta a ponta) | nenhuma — comece por essa |
| 2 | Seed de dados pra apresentação | nenhuma |
| 3 | Admin — tela simples | nenhuma |
| 4 | Profissional — tela simples | nenhuma |
| 5 | Aluno — dashboard simples | Task 1 (código do treino já commitado) |
| 6 | Atendente — dashboard de busca real | nenhuma |
| 7 | Apresentação (roteiro + ensaio + vídeo backup) | as outras, mas pode começar a montar desde já |

A história que fica pra apresentação: **atendente cadastra aluno → confirma pagamento → aluno faz check-in facial → aluno loga e monta o próprio treino.** Já está quase pronta — as 7 tasks são o acabamento em volta dela.

---

## CONTEXTO MESTRE — cole isso pra IA antes de pedir qualquer código

```
Você vai ajudar a implementar uma parte de um sistema chamado BigGym, um projeto de
gestão de academia. Siga ESTRITAMENTE as regras abaixo. Não invente padrão novo se já
existe um pronto. Não resolva de um jeito diferente do que está escrito. Se precisar
mudar algo fora do que foi pedido, PARE e avise antes de fazer.

## O que é o projeto
BigGym é um sistema de gestão de academia, trabalho de faculdade, só front-end (sem
backend real — os dados ficam no localStorage do navegador, simulando um banco).
Existem 4 papéis de usuário: admin (gestor), atendente (recepção/balcão), professional
(instrutor/personal trainer) e subscriber (aluno/cliente). O escopo desta rodada é
enxuto de propósito — é pra uma apresentação de 10 minutos, não pra virar produto.

## Stack exata (não trocar nem sugerir troca)
- React 18 + Vite 5 + TypeScript 5.5
- Tailwind CSS 3.4 (estilo via className, sem CSS separado)
- React Router DOM 6 (rotas)
- Zustand 4 (estado global — quem está logado)
- lucide-react (ícones, ex: <LayoutDashboard size={18} />)
- jspdf (geração de PDF, ex: comprovante), qrcode, @vladmandic/face-api (reconhecimento
  facial simulado), react-payment-inputs + flag-icons (campos de pagamento/DDI)
- Sem suíte de teste automatizada. Verificação = `npm run typecheck` (zero erro) +
  rodar `npm run dev` e olhar no navegador antes de qualquer commit.

## Regra de idioma
- Nomes de arquivo, pasta, variável, função: inglês SÓ nas pastas estruturais
  (types, data, store, components, features, routes).
- Nome de entidade/tipo/função de REGRA DE NEGÓCIO: português (ex: `Treino`,
  `obterAlunoPorId`, `AttendantCadastroPage`).
- Tudo que a pessoa que usa o sistema vê (texto de tela, botão, URL): português.
- Comentário de código e mensagem de commit: português.

## Estrutura de pastas (cada camada só conhece a de baixo)
src/types      -> forma de cada entidade (interface TypeScript, sem lógica)
src/data       -> um arquivo *Repository.ts por entidade (ler/gravar). Hoje é localStorage.
src/store      -> authStore.ts (Zustand) guarda quem está logado e o papel (role)
src/components -> common/ (peças reutilizáveis) e layout/ (moldura AppLayout + Sidebar)
src/features   -> uma pasta por papel: admin/, attendant/, professional/, subscriber/,
                  auth/, home/
src/routes     -> AppRoutes.tsx (mapa de URLs) e ProtectedRoute.tsx (trava por papel)

REGRA DE OURO 1: nenhuma tela lê ou grava dado direto — SEMPRE através das funções
do *Repository.ts correspondente (nunca manipular localStorage direto numa tela).
REGRA DE OURO 2: uma pasta dentro de features/ NUNCA importa de dentro de outra pasta
de features/ (ex: subscriber/ não importa nada de attendant/).
REGRA DE OURO 3: se a sua task pedir campo novo numa entidade que JÁ EXISTE em
src/types/*.ts, pare e avise o grupo antes.

## Padrão de Repository
As tasks desta rodada **reaproveitam repositories que já existem**
(`alunoRepository`, `pagamentoRepository`, `treinoRepository`) — nenhuma task daqui
cria entidade nova nem repository novo.

## Padrão de rota
Nenhuma das 7 tasks precisa de rota nova — todas usam rotas que já existem (`/admin`,
`/profissional`, `/aluno`, `/atendente`). O Sidebar.tsx tem entradas de menu pra rotas
que não existem ainda (ex: /admin/planos, /aluno/evolucao) — isso é propositalmente
fora de escopo, ignora.

## Componentes reutilizáveis — SEMPRE reaproveitar, nunca recriar do zero
- `<AppLayout>{conteúdo}</AppLayout>` — moldura obrigatória de toda página logada.
- `<Button variant="primary|secondary|danger">texto</Button>` — já tem hover pronto.
- `<Card title="opcional">{conteúdo}</Card>` — "quadrado" branco, unidade visual básica
  (ex: um card por número no dashboard).
- `<Table columns={[...]} rows={lista} rowKey={(linha) => linha.id} />` — tabela
  genérica, só define colunas.
Importar de `'../../components/common'` e `'../../components/layout'`.

## Paleta (classes Tailwind padrão, NÃO inventar cor nova)
`emerald-700`/`emerald-800` = marca/ação primária. `slate-*`/`zinc-*` = texto/fundo
neutro. `red-600`/`rose-600` = perigo. `amber-*` = aviso.

## Fluxo de verificação e Git
- Branch: `feature/<area>-<descricao-curta>` a partir da `main` atualizada.
- `npm run typecheck` sem erro + testar no navegador (`npm run dev`) antes de commitar.
- Commits pequenos, em português (`feat: ...`, `fix: ...`).
- NUNCA inventar regra de negócio que não esteja escrita na sua task.
```

---

## Tasks — cole só a sua, depois do CONTEXTO MESTRE

### Task 1 — Fechar a história principal

```
Minha task: garantir que o fluxo principal (cadastro do aluno → pagamento → check-in
facial → aluno monta o treino) funciona do início ao fim sem erro, e commitar o que
ainda falta.

Faça:
- Roda o fluxo inteiro numa aba anônima, do zero (sem dado de sessão antiga).
- Comita o que estiver pendente (treino da semana + catálogo de exercícios — `git
  status`/`git diff` pra ver o que falta commitar).
- Corrige qualquer erro que aparecer nesse caminho.

Não faça:
- Não adiciona feature nova — essa task é só fechar e garantir o que já existe.

Onde mexer: onde o erro estiver — provavelmente src/data/treinoRepository.ts,
src/types/treino.ts, src/features/subscriber/SubscriberTreinoPage.tsx.

Pronto quando: o fluxo completo roda sem travar, do início ao fim.
```

---

### Task 2 — Seed de dados pra apresentação

```
Minha task: deixar os dados de exemplo do sistema bons pra mostrar em público.

Faça:
- Trocar os dados em src/data/seed.ts por nome de aluno real (não "Aluno Teste 1"),
  plano com preço plausível, e um recorte pequeno e bem escolhido de exercícios (hoje
  tem cerca de 100 no catálogo — não precisa mostrar todos numa apresentação).

Não faça:
- Não muda o formato de nenhum type — só os valores dentro do seed.

Onde mexer: src/data/seed.ts.

Pronto quando: abrindo o sistema do zero, os dados que aparecem fazem sentido pra
mostrar em público.

Atenção: avisa o grupo antes de commitar — se alguém estiver testando o fluxo (Task 1)
ao mesmo tempo, pode dar conflito de branch.
```

---

### Task 3 — Admin: tela simples

```
Minha task: tirar o placeholder da tela do admin e mostrar número real.

Faça:
- Trocar o placeholder de AdminDashboardPage.tsx por 2-3 números reais: total de
  alunos cadastrados, quantos estão ativos.

Não faça:
- Não implementa receita, inadimplência nem aniversariantes — isso é financeiro de
  verdade, fora de escopo agora.

Onde mexer: src/features/admin/AdminDashboardPage.tsx, usando alunoRepository.ts (já
existe).

Pronto quando: a tela mostra número real, puxado do sistema, não texto fixo.
```

---

### Task 4 — Profissional: tela simples

```
Minha task: tirar o placeholder da tela do profissional e mostrar uma lista real.

Faça:
- Trocar o placeholder de ProfessionalDashboardPage.tsx por uma lista de alunos
  cadastrados (pode ser a lista geral — não precisa resolver vínculo de personal
  trainer).

Não faça:
- Não implementa agenda nem vínculo aluno-profissional — é só pra tela não ficar
  vazia na apresentação.

Onde mexer: src/features/professional/ProfessionalDashboardPage.tsx, usando
alunoRepository.ts.

Pronto quando: o profissional loga e vê uma lista de alunos real na tela.
```

---

### Task 5 — Aluno: dashboard simples

```
Minha task: tirar o placeholder do dashboard do aluno e mostrar nome, treino do dia e
pagamento.

Faça:
- Trocar o placeholder de SubscriberDashboardPage.tsx por: nome do aluno, o treino do
  dia (reaproveitar a lógica que já existe pra achar o exercício do dia de hoje), e um
  cartão com o pagamento mais recente desse aluno (pagamentoRepository) — só mostra o
  que já existe, não calcula nada novo.

Não faça:
- Não implementa geração automática de pagamento nem cálculo de atraso. Se o aluno
  não tiver pagamento no seed, mostra uma mensagem simples — não trava a tela.

Onde mexer: src/features/subscriber/SubscriberDashboardPage.tsx.

Pronto quando: o aluno loga e vê o próprio nome, o treino do dia e algum dado de
pagamento real.

Atenção: só comece essa depois que a Task 1 estiver commitada (o treino do dia depende
do código dela).
```

---

### Task 6 — Atendente: dashboard de busca real

```
Minha task: trocar a lista fixa de alunos por dado real na tela do atendente.

Faça:
- Trocar ALUNOS_MOCK (hoje dentro do próprio arquivo) por dado real, vindo de
  alunoRepository.obterAlunos(). Mantém os filtros e a paginação que já existem.

Não faça:
- Não implementa edição nem cancelamento de matrícula — só busca/listagem de verdade.

Onde mexer: src/features/attendant/AttendantDashboardPage.tsx, usando
alunoRepository.ts (e pagamentoRepository.ts pra situação de pagamento, se der tempo).

Pronto quando: a busca e os filtros funcionam com aluno real, não mais a lista fixa.
```

---

### Task 7 — Apresentação (não é código)

```
Minha task: organizar a apresentação de 10 minutos.

Faça:
- Roteiro: quem fala o quê, em que ordem as telas aparecem (sugestão: atendente
  cadastra → pagamento → check-in → aluno monta treino → passada rápida nas telas de
  admin e profissional).
- Ensaiar pelo menos uma vez com todo mundo antes do dia.
- Gravar um vídeo de backup do fluxo completo funcionando, pra não depender 100% do
  notebook/Wi-Fi no dia.

Pronto quando: existe roteiro escrito com o tempo de cada pessoa, e um vídeo de
backup gravado.
```

---

## Fora de escopo (não pega, não existe bloco pronto)

Motor de cobrança automática, agenda de personal trainer, vitrine/contratação de personal, RH completo, avaliação física, objetivo/recomendação de treino, edição/cancelamento de matrícula, LGPD, multi-tenant, backend real. Tudo isso ficou pra uma rodada futura, fora desta apresentação — detalhe de cada um está no arquivo completo e no histórico do Git.
