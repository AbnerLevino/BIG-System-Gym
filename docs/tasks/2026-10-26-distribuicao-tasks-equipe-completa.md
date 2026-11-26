# BigGym — Escopo reduzido pra apresentação (7 pessoas)

**Reduzido em:** 2026-11-15

**Por que isso mudou:** o backlog anterior (14 tasks + uma lista de 11 áreas futuras) foi pensado pra um produto de verdade, mas isso é trabalho de faculdade e vocês têm **10 minutos de apresentação**. Em vez de 14 telas pela metade, o grupo decidiu fechar bem uma história curta que já está quase pronta, e dar uma tela simples pros papéis que ainda não tinham nada. Motor de cobrança, agenda de personal, RH completo, vitrine de contratação, avaliação física, multi-tenant, LGPD etc. — tudo isso saiu do escopo ativo. **Nada foi perdido:** a versão completa anterior, com todo esse detalhe, continua no histórico do Git (comitada em `6599979`, e nas revisões anteriores deste mesmo arquivo) — se o grupo quiser retomar a ambição de produto depois que a disciplina acabar, está tudo lá.

**Numeração nova:** as tasks aqui vão de 1 a 7, numeração nova pra este escopo — não é a mesma numeração do backlog antigo (Task 6 antiga era "motor de cobrança", por exemplo; aqui Task 6 é outra coisa). Se alguém tiver uma branch com nome de task antiga, é só o nome que fica desatualizado, sem problema.

**Como usar isto com um assistente de IA:** cole o bloco "CONTEXTO MESTRE" inteiro antes de pedir qualquer código, depois cole só a sua task. Existe também um guia rápido, mais direto pra copiar e colar (`2026-11-14-guia-rapido-tasks-para-ia.md`), com o mesmo conteúdo em formato mais curto.

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
src/types/*.ts, pare e avise o grupo antes — outra parte do sistema pode depender
do formato atual.

## Padrão de Repository (copie esse padrão, não invente outro)
Cada arquivo `src/data/<entidade>Repository.ts` expõe funções no padrão:
- `inicializar<Entidades>()` — carrega o seed inicial se o localStorage estiver vazio
- `obter<Entidades>()` / `obter<Entidade>PorId(id)` / `obter<Entidades>Por<Campo>(valor)`
- `salvar<Entidade>(entidade)` — grava (cria ou atualiza)
As tasks desta rodada **reaproveitam repositories que já existem** (alunoRepository,
pagamentoRepository, treinoRepository) — nenhuma task daqui cria entidade nova.

## Padrão de rota — UMA TELA NOVA SEMPRE PRECISA DE DUAS COISAS, NUNCA SÓ UMA:
1. Registrar o path em `src/routes/AppRoutes.tsx`, envolvido em
   `<ProtectedRoute allowedRole="...">` (os papéis são: admin, atendente, professional,
   subscriber — nomes exatos, não traduzir).
2. Adicionar a entrada no menu em `src/components/layout/Sidebar.tsx`, dentro do objeto
   `NAV_ITEMS[papel]` (precisa de um ícone do lucide-react).
ATENÇÃO: o Sidebar.tsx já tem entradas de menu (NAV_ITEMS) pra rotas que NÃO existem
em AppRoutes.tsx e que **não fazem parte do escopo desta rodada** (ex: /admin/alunos,
/admin/planos, /admin/profissionais, /admin/financeiro, /aluno/evolucao,
/aluno/financeiro, /aluno/perfil). Nenhuma task daqui precisa registrar rota nova —
todas as 7 tasks usam rotas que já existem (/admin, /profissional, /aluno,
/atendente).

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

## Fluxo de verificação e Git
- Branch: `feature/<area>-<descricao-curta>` a partir da `main` atualizada.
- `npm run typecheck` sem erro + testar visualmente no navegador (`npm run dev`) antes
  de cada commit.
- Commits pequenos e frequentes, em português (`feat: ...`, `fix: ...`).
- NUNCA inventar uma regra de negócio que não esteja escrita na sua task.
```

---

## A história da apresentação (10 minutos)

O que já funciona de ponta a ponta, sem gambiarra: **atendente cadastra o aluno → confirma o pagamento (gera comprovante em PDF) → o aluno faz check-in por reconhecimento facial → o aluno loga e monta o próprio treino da semana, escolhendo exercício de um catálogo real.** É essa a história que a apresentação conta — já está praticamente pronta no código.

As 7 tasks abaixo são o acabamento em volta dela: garantir que não quebra, deixar os dados bonitos pra mostrar em público, e dar uma tela simples pros 2 papéis que hoje ainda são só placeholder (admin e profissional), pra ninguém assistir a apresentação e perguntar "e o resto do sistema?".

**Fora de escopo por agora (não é pra fazer, nem pra pedir pra IA fazer):** motor de cobrança automática, agenda de personal trainer, vitrine/contratação de personal, cadastro de RH completo, avaliação física, objetivo e recomendação de treino, edição/cancelamento de matrícula, qualquer coisa de LGPD, multi-tenant ou backend real.

**Ordem recomendada:** a Task 1 vem primeiro — alguém precisa commitar o que já está pronto pra todo mundo trabalhar em cima do mesmo código (a Task 5 principalmente depende disso). As Tasks 2 a 6 podem rodar em paralelo depois. A Task 7 (apresentação) é contínua — quem pegar já pode ir montando o roteiro desde o início, e fecha por último.

---

## Task 1 — Fechar a história principal

**O que fazer:**
- Revisar o que já está pronto mas ainda não foi commitado (treino da semana + catálogo de exercícios) — `git status` / `git diff`, testar, commitar.
- Rodar o fluxo completo do zero, numa aba anônima (sem dado de sessão antiga): cadastrar aluno → pagar → ver comprovante → check-in facial → logar como esse aluno → montar o treino da semana.
- Corrigir qualquer erro encontrado nesse caminho — é exatamente isso que vai ser mostrado na apresentação, não pode travar.

**Onde mexer:** onde o problema estiver — provavelmente `src/data/treinoRepository.ts`, `src/types/treino.ts`, `src/features/subscriber/SubscriberTreinoPage.tsx` (mudanças pendentes de commit), ou qualquer tela do atendente se achar algo quebrado.

**Não faça:** não adiciona feature nova — essa task é só fechar e garantir o que já existe.

**Pronto quando:** o fluxo inteiro roda sem erro, do início ao fim, numa máquina/navegador limpo.

---

## Task 2 — Seed de dados pra apresentação

**O que fazer:** trocar os dados de exemplo (`src/data/seed.ts`) por dados que ficam bem numa tela compartilhada com o professor/turma: nome de aluno real (não "Aluno Teste 1"), plano com preço plausível, um recorte pequeno e bem escolhido de exercícios (hoje tem ~100 no catálogo — não precisa rolar uma lista enorme durante a apresentação).

**Onde mexer:** `src/data/seed.ts`.

**Não faça:** não muda o formato de nenhum type — só os valores dentro do seed.

**Pronto quando:** ao abrir o sistema do zero, os dados que aparecem (aluno, plano, exercícios) fazem sentido pra mostrar em público.

**Atenção:** avisa o grupo antes de commitar — quem estiver testando o fluxo (Task 1) ao mesmo tempo pode ter conflito de branch.

---

## Task 3 — Admin: tela simples

**O que fazer:** trocar o placeholder de `AdminDashboardPage.tsx` por 2-3 números reais: total de alunos cadastrados, quantos estão ativos.

**Onde mexer:** `src/features/admin/AdminDashboardPage.tsx`, usando `alunoRepository.ts` (já existe, não precisa criar nada).

**Não faça:** não implementa receita, inadimplência nem aniversariantes — isso é financeiro de verdade, fora de escopo agora.

**Pronto quando:** a tela mostra números reais, puxados do sistema (não texto fixo de placeholder).

---

## Task 4 — Profissional: tela simples

**O que fazer:** trocar o placeholder de `ProfessionalDashboardPage.tsx` por uma lista de alunos cadastrados (pode ser a lista geral — não precisa resolver vínculo de personal trainer, isso é fora de escopo agora).

**Onde mexer:** `src/features/professional/ProfessionalDashboardPage.tsx`, usando `alunoRepository.ts`.

**Não faça:** não implementa agenda nem vínculo aluno-profissional — é só pra a tela não ficar vazia na apresentação.

**Pronto quando:** o profissional loga e vê uma lista de alunos na tela, vinda de dado real.

---

## Task 5 — Aluno: dashboard simples

**O que fazer:** trocar o placeholder de `SubscriberDashboardPage.tsx` por: nome do aluno, o treino do dia (reaproveitar a lógica que já existe pro treino — achar o exercício do dia de hoje pra esse aluno), e um cartão com o pagamento mais recente desse aluno (`pagamentoRepository`), só mostrando o que já existe, sem calcular nada novo.

**Onde mexer:** `src/features/subscriber/SubscriberDashboardPage.tsx`.

**Não faça:** não implementa geração automática de pagamento nem cálculo de atraso. Se o aluno não tiver nenhum pagamento no seed, mostra uma mensagem simples — não pode travar a tela.

**Pronto quando:** o aluno loga e vê o próprio nome, o treino do dia e algum dado de pagamento real.

**Depende de:** Task 1 (precisa do código do treino já commitado) e, se possível, Task 2 (dado de pagamento melhor no seed).

---

## Task 6 — Atendente: dashboard de busca real

**O que fazer:** trocar a lista fixa (`ALUNOS_MOCK`, hoje dentro do próprio arquivo) por dado real, vindo de `alunoRepository.obterAlunos()`. Mantém os filtros e a paginação que já existem na tela.

**Onde mexer:** `src/features/attendant/AttendantDashboardPage.tsx`, usando `alunoRepository.ts` e `pagamentoRepository.ts` (pra mostrar situação de pagamento, se der tempo).

**Não faça:** não implementa edição nem cancelamento de matrícula — fora de escopo agora, só busca/listagem de verdade.

**Pronto quando:** a busca e os filtros funcionam com aluno real cadastrado no sistema, não mais a lista fixa de exemplo.

---

## Task 7 — Apresentação

**O que fazer:**
- Roteiro dos 10 minutos: quem fala o quê, em que ordem as telas aparecem (sugestão: segue a história — atendente cadastra → pagamento → check-in → aluno monta treino → passada rápida pelas telas simples de admin e profissional).
- Ensaiar pelo menos uma vez com todo mundo antes do dia.
- Gravar um vídeo de backup do fluxo completo funcionando, pra não depender 100% do notebook/Wi-Fi no dia da apresentação.

**Não faça:** essa task não é código — não precisa de branch nem de typecheck.

**Pronto quando:** existe um roteiro escrito com o tempo de cada pessoa, e um vídeo de backup gravado.
