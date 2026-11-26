# Contexto mestre — BigGym

**Criado em:** 2026-11-15
**O que é esta pasta:** o backlog definitivo do projeto, dividido em 7 módulos — um por pessoa. Cada módulo tem o próprio arquivo, completo e autossuficiente (requisito, regra de negócio, formato de dado, onde mexer, critério de aceite). Este arquivo (`00-`) é o único que todo mundo usa em comum.

## Como usar (3 passos)

1. Abra uma conversa nova com a IA e cole o bloco **CONTEXTO MESTRE** abaixo, sozinho, sem mais nada.
2. Depois que a IA responder, abra o arquivo do **seu módulo** (tabela abaixo) e cole o item que você vai fazer.
3. Peça pra implementar. No final, roda `npm run dev`, olha no navegador se ficou certo, só então marca o checkbox `[x]` no seu arquivo de módulo e avisa o grupo.

Se a IA sugerir mudar alguma regra, criar algo diferente do que o bloco pede, ou "simplificar" algo fora do que foi pedido — não aceita, pede pra ela seguir exatamente o que está escrito.

## Mapa dos módulos

| Arquivo | Módulo | Responsável | Depende de |
|---|---|---|---|
| `01-fundacao.md` | Fundação (catálogo de exercícios, motor de cobrança, agenda do profissional) | — | nenhum — fornece contrato pros outros |
| `02-atendente.md` | Atendente | — | Fundação (bloqueio de check-in) |
| `03-admin.md` | Admin | — | Fundação (dashboard financeiro) |
| `04-profissional.md` | Profissional | **já em andamento** | Fundação (agenda) |
| `05-aluno-conta-treino.md` | Aluno — conta e treino | — | Fundação (catálogo de exercícios) |
| `06-aluno-financeiro-evolucao.md` | Aluno — financeiro e evolução | — | Fundação (cobrança, agenda) + Profissional (avaliação física) |
| `07-apresentacao.md` | Apresentação (não é código) | — | todos os outros |

---

## CONTEXTO MESTRE — cole isso pra IA antes de pedir qualquer código

```
Você vai ajudar a implementar uma parte de um sistema chamado BigGym, um projeto de
gestão de academia (trabalho de faculdade). Siga ESTRITAMENTE as regras abaixo. Não
invente padrão novo se já existe um pronto. Não resolva de um jeito diferente do que
está escrito. Se precisar mudar algo fora do que foi pedido, PARE e avise antes de fazer.

## O que é o projeto
BigGym é um sistema de gestão de academia, só front-end (sem backend real — os dados
ficam no localStorage do navegador, simulando um banco). Existem 4 papéis de usuário:
admin (gestor), atendente (recepção/balcão), professional (instrutor/personal trainer)
e subscriber (aluno/cliente). Este é o backlog completo do projeto, dividido em 7
módulos — um módulo = um responsável = entrega inteira.

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
src/types/*.ts, pare e avise o grupo antes de mudar — outra parte do sistema pode
depender do formato atual.

## Padrão de Repository (copie esse padrão, não invente outro)
Cada arquivo `src/data/<entidade>Repository.ts` expõe funções no padrão:
- `inicializar<Entidades>()` — carrega o seed inicial se o localStorage estiver vazio
- `obter<Entidades>()` / `obter<Entidade>PorId(id)` / `obter<Entidades>Por<Campo>(valor)`
- `salvar<Entidade>(entidade)` — grava (cria ou atualiza)
Algumas tasks reaproveitam repository que já existe (alunoRepository, pagamentoRepository,
treinoRepository, planoRepository, atendenteRepository, profissionalRepository,
avaliacaoFisicaRepository); outras criam repository novo (ex: exercicioRepository,
agendaProfissionalRepository) — sempre seguindo este mesmo padrão. Se criar repository
novo, registrar em `src/data/index.ts` e dentro de `inicializarTodosOsDados()`.

## Padrão de rota — UMA TELA NOVA SEMPRE PRECISA DE DUAS COISAS, NUNCA SÓ UMA:
1. Registrar o path em `src/routes/AppRoutes.tsx`, envolvido em
   `<ProtectedRoute allowedRole="...">` (os papéis são: admin, atendente, professional,
   subscriber — nomes exatos, não traduzir).
2. Adicionar a entrada no menu em `src/components/layout/Sidebar.tsx`, dentro do objeto
   `NAV_ITEMS[papel]` (precisa de um ícone do lucide-react).
O Sidebar.tsx já tem entradas de menu (NAV_ITEMS) reservadas pra paths que ainda não
existem em AppRoutes.tsx (ex: /admin/planos, /admin/profissionais, /admin/financeiro,
/aluno/evolucao, /aluno/financeiro). Se a sua task pedir uma dessas telas, use
EXATAMENTE o path já reservado no Sidebar — não invente um path diferente pra mesma
tela.

## Componentes reutilizáveis — SEMPRE reaproveitar, nunca recriar do zero
Importar de `'../../components/common'` (Button, Input, Card, Table, Modal, SeletorDdi)
e de `'../../components/layout'` (AppLayout).

- `<AppLayout>{conteúdo da página}</AppLayout>` — moldura obrigatória de toda página
  logada (sidebar + área de conteúdo).
- `<Button variant="primary|secondary|danger">texto</Button>` — já tem hover animado
  pronto; não reimplementar.
- `<Card title="opcional">{conteúdo}</Card>` — "quadrado" branco com borda e sombra
  leve, unidade visual básica pra agrupar conteúdo (ex: um card por número no dashboard).
- `<Table columns={[{header: 'Nome', render: (linha) => linha.campo}]} rows={lista}
  rowKey={(linha) => linha.id} />` — tabela genérica, só define colunas.

## Paleta (classes Tailwind padrão, NÃO inventar cor nova)
- `emerald-700` / `emerald-800` = cor de marca / ação primária.
- `slate-*` = texto e borda neutra. `zinc-*` = fundo de estrutura.
- `red-600` / `rose-600` = perigo. `amber-*` = aviso/nível intermediário.

## Regras de negócio fixas (valem pra TODOS os módulos — não reabrir essas decisões)
- D1 — Mudar `Plano.price` só afeta `Pagamento` gerado a partir daquele momento.
  Pagamento já gerado mantém `originalValue` congelado — a geração sempre lê o
  `Plano.price` vigente no momento em que gera, nunca recalcula um pagamento existente.
- D2 — Não existe conceito de plano "descontinuado". Não implementar.
- D3 — Receita conta por COMPETÊNCIA: mês do `dueDate` (vencimento), não o mês em que
  foi pago de fato.
- D4 — Inadimplência: vencimento sem pagamento -> carência de 5 dias corridos -> a
  partir do 6º dia sem pagamento, check-in/catraca bloqueado.
- D5 — Sem multa por atraso. `Pagamento.lateFee` existe no type mas não é usado por
  nenhuma regra — não implementar cálculo de multa. A única consequência do atraso é
  o bloqueio de check-in (D4).
- D6 — Sem gateway de pagamento real nem backend real por agora — tudo simulado.
- D7 — Se o aluno tem personal (`Atendimento.type === 'personal'`), o
  `Atendimento.value` entra somado no próximo `Pagamento` gerado automaticamente,
  junto da mensalidade — NÃO é cobrança separada.
- D9 — Cadastro completo de funcionário (Atendente/Profissional) precisa de: nome
  completo, CPF, RG, endereço, telefone, contato de emergência, dados bancários, tipo
  de contratação, cargo/função, data de admissão, salário, e CREF (só em Profissional,
  opcional). Não duplicar e-mail de contato com `Usuario.email` (login).
- D10 — Contas a pagar (salário + despesas) fica FORA de escopo agora.
- D11 — Aluno com personal já vinculado vê só aquele profissional, sem vitrine. Aluno
  `standard` vê a vitrine de personal trainers disponíveis.
- D12 — Contratar um personal atualiza o `Atendimento` do aluno; o valor extra só
  aparece no próximo `Pagamento` gerado automaticamente — nenhum pagamento nasce na
  hora da contratação.
- D13 — Agenda do profissional é grade semanal RECORRENTE (dia + hora início/fim). Sem
  bloqueio de data pontual (férias/falta) nesta rodada.
- D14 — Quem edita a agenda do profissional é o próprio profissional, nunca o admin.
- D19 — Avaliação física principal e mensal são a MESMA entidade (`AvaliacaoFisica`),
  diferenciadas pelo campo `tipo` — não criar entidade nova.

## Fluxo de verificação e Git
- Branch: `feature/<area>-<descricao-curta>` a partir da `main` atualizada.
- `npm run typecheck` sem erro + testar visualmente no navegador (`npm run dev`) antes
  de cada commit.
- Commits pequenos e frequentes, em português (`feat: ...`, `fix: ...`).
- NUNCA inventar uma regra de negócio que não esteja escrita na sua task.
```
