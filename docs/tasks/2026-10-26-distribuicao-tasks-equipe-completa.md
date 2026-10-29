# BigGym — Backlog completo e divisão por pessoa (equipe de 6)

**Data:** 2026-10-26
**Este documento substitui, pra uso do dia a dia, os dois docs anteriores** (`2026-10-25-distribuicao-tasks-aluno.md` e `2026-10-26-distribuicao-tasks-admin-profissional-financeiro.md`) — eles continuam existindo como histórico, mas a partir de agora **é este arquivo que a equipe usa**. Ele junta as duas rodadas de task em um só lugar, com tudo que uma pessoa (ou uma IA tipo ChatGPT/Claude ajudando essa pessoa) precisa pra não inventar regra nem quebrar padrão do projeto.

**Como usar isto com um assistente de IA:** se você não programa e vai pedir ajuda a uma IA (ChatGPT, Claude, Copilot etc.), **cole o bloco "CONTEXTO MESTRE" inteiro** na conversa antes de pedir qualquer código, e depois cole só a sua task específica (a sua, não as outras). A IA não deve inventar componente novo, não deve mudar type que já existe sem avisar, e não deve resolver nenhuma "decisão já fechada" de um jeito diferente do que está escrito — essas regras já foram validadas com o responsável do projeto, não é pra reabrir.

---

## CONTEXTO MESTRE — cole isso pra IA antes de pedir qualquer código

```
Você vai ajudar a implementar uma parte de um sistema chamado BigGym, um projeto de
gestão de academia. Siga ESTRITAMENTE as regras abaixo. Não invente padrão novo se já
existe um pronto. Não resolva de um jeito diferente do que está escrito. Se precisar
mudar algo fora do que foi pedido, PARE e avise antes de fazer.

## O que é o projeto
BigGym é um sistema de gestão de academia, hoje só front-end (sem backend real — os
dados ficam no localStorage do navegador, simulando um banco). É trabalho de faculdade
com ambição de virar produto vendido pra academias reais depois. Existem 4 papéis de
usuário: admin (gestor), atendente (recepção/balcão), professional (instrutor/personal
trainer) e subscriber (aluno/cliente).

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
                  auth/, home/, financial/ (compartilhado entre papéis)
src/routes     -> AppRoutes.tsx (mapa de URLs) e ProtectedRoute.tsx (trava por papel)

REGRA DE OURO 1: nenhuma tela lê ou grava dado direto — SEMPRE através das funções
do *Repository.ts correspondente (nunca manipular localStorage direto numa tela).
REGRA DE OURO 2: uma pasta dentro de features/ NUNCA importa de dentro de outra pasta
de features/ (ex: subscriber/ não importa nada de attendant/). Se precisar de algo
em comum, isso sobe pra components/ ou pra uma feature compartilhada (financial/).
REGRA DE OURO 3: se a sua task pedir campo novo numa entidade que JÁ EXISTE em
src/types/*.ts, pare e avise o grupo antes — outra parte do sistema pode depender
do formato atual.

## Padrão de Repository (copie esse padrão, não invente outro)
Cada arquivo `src/data/<entidade>Repository.ts` expõe funções no padrão:
- `inicializar<Entidades>()` — carrega o seed inicial se o localStorage estiver vazio
  (chamado uma vez em `src/data/index.ts`, dentro de `inicializarTodosOsDados()`)
- `obter<Entidades>()` / `obter<Entidade>PorId(id)` / `obter<Entidades>Por<Campo>(valor)`
- `salvar<Entidade>(entidade)` — grava (cria ou atualiza)
Toda entidade nova precisa: 1) type em src/types/, 2) repository em src/data/ seguindo
esse padrão, 3) export em `src/data/index.ts` (barrel) e registro em
`inicializarTodosOsDados()`, 4) seed de exemplo se fizer sentido (ver `src/data/seed.ts`).

## Padrão de rota — UMA TELA NOVA SEMPRE PRECISA DE DUAS COISAS, NUNCA SÓ UMA:
1. Registrar o path em `src/routes/AppRoutes.tsx`, envolvido em
   `<ProtectedRoute allowedRole="...">` (os papéis são: admin, atendente, professional,
   subscriber — nomes exatos, não traduzir).
2. Adicionar a entrada no menu em `src/components/layout/Sidebar.tsx`, dentro do objeto
   `NAV_ITEMS[papel]` (precisa de um ícone do lucide-react).
Se fizer só o passo 1, a tela existe mas ninguém acha ela (sem link no menu).
Se fizer só o passo 2, o link aparece mas quebra ao clicar (rota não existe).
ATENÇÃO: o Sidebar.tsx já tem algumas entradas de NAV_ITEMS apontando pra rotas que
ainda NÃO existem em AppRoutes.tsx (ex: /admin/planos, /admin/profissionais,
/admin/financeiro, /aluno/treino, /aluno/evolucao, /aluno/financeiro). Isso é
intencional — são os paths que a sua task deve usar quando for registrar a rota.
Confira o arquivo antes de inventar um path diferente.

## Componentes reutilizáveis — SEMPRE reaproveitar, nunca recriar do zero
Importar de `'../../components/common'` (Button, Input, Card, Table, Modal, SeletorDdi)
e de `'../../components/layout'` (AppLayout).

- `<AppLayout>{conteúdo da página}</AppLayout>` — moldura obrigatória de toda página
  logada (sidebar + área de conteúdo). Toda página de features/ usa isso por fora.
- `<Button variant="primary|secondary|danger">texto</Button>` — já tem o efeito de
  hover animado (borda desenhando ao redor no hover) pronto; NÃO reimplementar hover
  customizado num botão novo, usar este componente.
- `<Card title="opcional">{conteúdo}</Card>` — "quadrado" branco com borda e sombra
  leve, é a unidade visual básica pra agrupar conteúdo (ex: um card por métrica no
  dashboard, um card por item de lista).
- `<Input label="Nome do campo" value=... onChange=... />` — campo de formulário com
  label e foco destacado em verde (emerald), estende todas as props normais de
  `<input>` do HTML.
- `<Table columns={[{header: 'Nome', render: (linha) => linha.campo}]} rows={lista}
  rowKey={(linha) => linha.id} />` — tabela genérica, só define colunas, não estiliza
  nada na mão.
- `<Modal open={bool} title="..." onClose={fn}>{conteúdo}</Modal>` — janela
  sobreposta (ex: confirmar cancelamento, formulário rápido).
- `<SeletorDdi />` — seletor de código de país pra telefone (já usado no cadastro).

## Paleta e tipografia (classes Tailwind padrão, NÃO inventar cor nova)
- `emerald-700` / `emerald-800` = cor de marca / ação primária (botão principal, foco
  de input, item de menu ativo).
- `slate-*` = texto e borda neutra.
- `zinc-*` = fundo de estrutura (fundo da página, bordas sutis da moldura).
- `red-600` / `red-700` = perigo (cancelamento, exclusão, erro).
- Fonte de texto: `font-sans` (Instrument Sans, é o padrão, não precisa escrever a
  classe). Fonte de título/heading: `font-heading` (Outfit) — usar em `<h1>`/`<h2>`
  de destaque quando fizer sentido.
- Hover em item de lista/menu: `transition-all duration-200 ease-out hover:scale-105`
  (ligeiro aumento de escala) — é o padrão já usado no Sidebar, reaproveitar em listas
  clicáveis novas (ex: lista de alunos, lista de personal trainers).

## Fluxo de verificação e Git
- Branch: `feature/<area>-<descricao-curta>` a partir da `main` atualizada.
- `npm run typecheck` sem erro + testar visualmente no navegador (`npm run dev`) antes
  de cada commit.
- Commits pequenos e frequentes, em português (`feat: ...`, `fix: ...`, `refactor: ...`).
- NUNCA inventar uma regra de negócio que não esteja escrita na sua task — se tiver
  dúvida, perguntar antes de implementar um jeito "que parece fazer sentido".
```

---

## Divisão por pessoa (6 pessoas)

A ideia: cada bloco agrupa tasks da mesma área, pra quem pegar não ficar pulando entre partes muito diferentes do sistema. Os blocos 5 e 6 têm uma task de "fundação" (lógica sem tela, mais abstrata) — se alguém do grupo tem mais prática/confiança com lógica (e não só tela), faz sentido esse pegar um desses dois blocos. Isso é sugestão, não regra fixa — reorganizem como quiserem, só respeitem as dependências marcadas.

| Bloco | Pessoa | Tasks | Dependência interna |
|---|---|---|---|
| 1 | — | Task 1 (catálogo de exercícios) → Task 3 (treino da semana) | Task 3 depende da 1 — mesma pessoa faz em sequência |
| 2 | — | Task 4 (objetivo e recomendação) + Task 13 (avaliação física) | Task 4 depende da Task 1 (bloco 1) estar pronta |
| 3 | — | Task 2 (ativação de conta) + Task 5 (dashboard do atendente, busca/edição/cancelamento) | Nenhuma entre si |
| 4 | — | Task 7 (gestão de planos) + Task 8 (cadastro de funcionários/RH) | Nenhuma entre si |
| 5 | — | Task 6 (fundação: cobrança automática) → Task 9 (dashboard financeiro admin) → Task 14 (dashboard do aluno + pagar no app) | 9 e 14 dependem da 6 — fazer a 6 primeiro |
| 6 | — | Task 11 (fundação: agenda do personal) → Task 10 (dashboard do profissional) → Task 12 (vitrine de personal + contratação) | 10 e 12 dependem da 11 — fazer a 11 primeiro |

**Coordenação entre blocos 1 e 2:** Task 3 e Task 4 consomem o mesmo catálogo de exercícios (Task 1) e precisam combinar o mesmo formato de `grupoMuscular` antes de sair implementando cada um do seu jeito — falem entre si antes de começar.

**Gap conhecido, fora de escopo por agora:** o Sidebar já tem uma entrada `/admin/alunos` que não corresponde a nenhuma task abaixo (hoje gestão de aluno é só pelo atendente). Não implementem isso ainda — fica pra uma rodada futura, com regra de negócio a definir (o que o admin pode fazer ali que o atendente já não faz?).

---

## Regras gerais de todas as tasks
(resumo — a versão completa está no CONTEXTO MESTRE acima)
- Branch `feature/<area>-<descricao>`, commits pequenos em português.
- Repository pattern, nunca ler/gravar dado direto numa tela.
- Feature nunca importa de outra feature.
- Campo novo em type existente → avisar o grupo antes.
- Tela nova → rota em `AppRoutes.tsx` **e** entrada em `Sidebar.tsx`.
- Reaproveitar Button/Card/Input/Table/Modal/AppLayout — não recriar.

---

## Decisões de negócio já fechadas (não reabrir — só tirar dúvida de detalhe)

**Matrícula e plano**
- D1. Aumentar o preço de um `Plano` só afeta pagamento gerado a partir daquele momento; matrícula já ativa mantém o valor antigo (`Pagamento.originalValue` já é congelado por registro — a Task 6 garante isso).
- D2. Sem conceito de plano "descontinuado".

**Cobrança e inadimplência**
- D3. Receita do Admin é por **competência**: pagamento conta no mês do `dueDate` (vencimento), não no mês em que foi de fato pago.
- D4. Inadimplência: vencimento sem pagamento → carência de **5 dias corridos** → a partir do 6º dia sem pagamento, **check-in/catraca bloqueado**.
- D5. **Sem multa por atraso.** A única consequência do atraso é o bloqueio de acesso (D4) — nada de cobrança extra. `Pagamento.lateFee` existe no type mas não é usado por regra nenhuma; não implementar cálculo de multa.
- D6. Backend e gateway de pagamento real continuam fora de escopo — tudo simulado (igual ao `pagamentoService.ts` atual).
- D7. Cobrança automática do aluno: o sistema gera o próximo `Pagamento` automaticamente (Task 6) e o aluno paga **dentro do app** no próprio dashboard, reaproveitando o mesmo fluxo simulado que o atendente já usa no balcão — sem gateway real.

**Pessoas/cadastro**
- D8. Ativação de conta do aluno: senha NUNCA é definida pelo atendente — o `Usuario` nasce "pendente de senha" com token de ativação (expira em 48h, uso único); o aluno define a própria senha depois, via link (simulado na tela, sem e-mail real).
- D9. Funcionário (`Atendente` + `Profissional`): cadastro completo precisa de nome completo, CPF, RG, endereço, telefone, contato de emergência, dados bancários, tipo de contratação, cargo/função, data de admissão, valor de salário, e CREF (só em `Profissional`, campo opcional). E-mail de login já existe via `Usuario.email` — não duplicar.
- D10. Contas a pagar (salário + despesas da academia) fica fora de escopo nesta rodada — essa rodada cobre só o cadastro de dados do funcionário.

**Profissional / personal trainer**
- D11. Aluno com `Atendimento` tipo `personal` já vinculado → vê só aquele profissional. Aluno `standard` → vê uma vitrine com os personal trainers disponíveis pra contratar.
- D12. Contratar um personal atualiza o `Atendimento` do aluno (`type: 'personal'`, `profissionalId`, `value`) — o valor extra entra no próximo `Pagamento` automático, junto da mensalidade. **Não é cobrança separada** — o personal é "da academia".
- D13. Agenda do personal: grade **semanal recorrente** (dia da semana + horário início/fim, repete toda semana). Sem bloqueio de data pontual (férias/falta) nesta rodada.
- D14. Quem edita a agenda é **o próprio profissional**, não o admin.

**Treino e avaliação física**
- D15. Aluno com `Atendimento` tipo `personal` ativo → o profissional continua montando o treino manualmente (hoje isso **não existe implementado ainda em lugar nenhum**, apesar de ter sido tratado como "fluxo atual" num doc anterior — é greenfield).
- D16. Aluno só `standard` → monta a própria grade de treino, escolhendo exercícios do catálogo (Task 1) pra cada dia da semana.
- D17. Objetivo do aluno (`perder peso | ganhar peso | ganhar músculo | definição`) associa a grupos musculares → aluno seleciona 1+ grupos → exercícios recomendados = união dos exercícios desses grupos, do catálogo (Task 1). Essa entidade é nova (`ObjetivoAluno` ou equivalente) — **não reaproveitar** `AvaliacaoFisica.objective` nem `Meta`, são três conceitos diferentes.
- D18. `Meta.profissionalId` passa de obrigatório pra opcional (`profissionalId?: string`) — `Meta` vale pra qualquer aluno, com ou sem personal; sem personal, o status (`inProgress`/`completed`/`late`) é calculado automaticamente comparando com `CheckIn` (frequência) e `AvaliacaoFisica` mais recente (peso).
- D19. Avaliação física: profissional lança uma avaliação **principal** (referência) e avaliações **mensais** de acompanhamento (frequência/progresso) — mesma entidade `AvaliacaoFisica`, diferenciada por um campo de tipo, sem criar entidade nova.

-
## Diagnóstico — o que já existe e o que é placeholder (checado no código, não só nos docs)

- Attendant: cadastro, pagamento, comprovante, check-in e face ID já funcionam.
- `Pagamento` já tem `dueDate`/`status`/`lateFee` no type, mas **a geração automática não existe** — só a aprovação simulada (Task 6 cria essa parte).
- `AttendantCheckinPage.tsx` já reserva a mensagem `latePayment` mas não usa — bloqueio não implementado (Task 6/5).
- `admin`, `professional`, `subscriber` são hoje só uma tela placeholder cada, sem função real.
- `treinoRepository.ts` existe mas não é consumido em lugar nenhum — o treino montado pelo personal (D15) precisa ser criado do zero, não é "não mexer".

---

## Status de implementação (atualizado em 2026-10-29)

Resumo do que já tem código no repositório, pra quem for pegar uma task não refazer o que já existe e já saber exatamente o que falta. Commit de referência: `655a0e7`.

**Task 1 — Catálogo de exercícios: só o type, resto falta.**
- ✅ `src/types/exercicio.ts` criado: `Exercicio` (id, nome, descricao, grupoMuscular, nivelDificuldade, equipamento, videoUrl?, animacaoUrl?), `GrupoMuscular` e `NivelDificuldadeExercicio`.
- ❌ Falta `exercicioRepository.ts`, seed em `src/data/seed.ts` e registro em `inicializarTodosOsDados()`. Os exercícios que aparecem na tela (Task 3) hoje são um array mockado dentro da própria página (`exerciciosMock` em `SubscriberTreinoPage.tsx`), só pra validar o visual — não é fonte de dado real, quem pegar a Task 1 substitui isso.

**Task 3 — Treino do aluno sem personal: só a tela de catálogo (visual), sem lógica de treino.**
- ✅ `src/features/subscriber/SubscriberTreinoPage.tsx` criado e rota `/aluno/treino` registrada em `AppRoutes.tsx` (o Sidebar já tinha o link previsto, faltava só a rota).
- ✅ Grid de cards de exercício (gif/imagem, chip de dificuldade, chip de equipamento, grupo muscular) + modal de detalhe (usa o novo `size="lg"` do `Modal`) com espaço reservado pra vídeo-aula.
- ❌ Falta a regra de negócio da task em si: `Treino` (`src/types/treino.ts`) ainda não tem dia da semana nem referência ao catálogo; não existe fluxo de "selecionar exercício pra um dia"; não tem filtro por grupo muscular (os 4 exercícios mockados aparecem todos juntos); não consome `exercicioRepository` (ainda não existe) nem `treinoRepository`.

**Task 5 — Dashboard do atendente: UI de busca/listagem com dado mockado, falta tudo que grava/edita.**
- ✅ `AttendantDashboardPage.tsx` deixou de ser placeholder: busca por nome/matrícula, filtros (em dia / atrasado / vence hoje / vence essa semana) e tabela paginada (11 linhas por página).
- ❌ A lista (`ALUNOS_MOCK`) é estática dentro do próprio arquivo, não vem de `alunoRepository`. Ainda não tem edição de dados do aluno, cancelamento de matrícula, nem os acessos rápidos pra cadastro/check-in/pagamento — isso é o que falta pra fechar a Task 5 de fato.

**Melhorias de base, já disponíveis pra todo mundo reaproveitar:**
- `Modal` (`src/components/common/Modal.tsx`) ganhou a prop `size?: 'md' | 'lg'` (`md` é o comportamento de antes, `lg` é mais largo) e o conteúdo interno agora rola (`overflow-y-auto`) quando passa da altura da tela — útil pra qualquer modal com mais conteúdo.
- `tailwind.config.js` ganhou a animação `animate-aurora-sweep` (usada no botão "Ver mais" do card de exercício — brilho deslizando no hover). Se for fazer outro botão com hover "chamativo", a classe já está pronta, não reinventar.
- `src/assets/waving-hand-3d.png` — ícone de mão acenando usado no cabeçalho de boas-vindas do atendente (`Boas-Vindas, {nome}!`); disponível pra reaproveitar em outro dashboard que também queira esse padrão de saudação.

---

## As 14 tasks

### Task 1 — Fundação: catálogo de exercícios (bloqueia Tasks 3 e 4)
**Requisito:** `docs/requisitos/fundacao/catalogo-exercicios.md` (RF-FUND-01).
**O que fazer:** criar o catálogo de exercícios que ainda não existe. Hoje `Treino.exercises` é só `{name, sets, reps}` — sem grupo muscular, dificuldade, descrição ou vídeo/animação. Criar entidade nova (ex: `src/types/exercicio.ts`): nome, descrição, grupo(s) muscular(es), nível de dificuldade, URL de vídeo-aula, URL de animação (gif em loop — já pesquisado: [ExerciseDB](https://exercisedb.dev/) tem banco gratuito pronto, free tier sem chave; só guardar a URL, não implementar geração de animação).
**Onde mexer:** `src/types/exercicio.ts` (novo), `src/data/exercicioRepository.ts` (novo), `src/data/seed.ts` (seed de exemplo).
**Onde NÃO mexer:** `src/types/treino.ts` ainda não — isso é da Task 3.
**Decisão já fechada:** não confundir com `Treino.exercises` — catálogo é "o que existe pra escolher", `Treino` é "o que foi escolhido pra esse aluno, nesse dia".

---

### Task 2 — Ativação de conta do aluno
**Requisitos:** `docs/requisitos/atendente/ativacao-conta-acesso.md` (RF-ATD-04/05/06/07) + `docs/requisitos/aluno/criacao-senha-ativacao.md` (RF-ALU-01).
**O que fazer:** hoje o atendente cria o `Usuario` do aluno já com senha, em `AttendantCadastroPage.tsx` — desalinhado com D8. Corrigir: ao confirmar pagamento, criar `Usuario` em estado "pendente de senha" com token de ativação (expira em 48h, uso único). Aluno abre tela nova, define a senha, aí a conta vira utilizável.
  **Onde mexer:** `src/types/usuario.ts` (campos de token/status pendente), `src/data/usuarioRepository.ts` (criar convite / validar token / definir senha), `AttendantCadastroPage.tsx` (parar de pedir senha, mostrar link de ativação simulado na tela), tela nova em `src/features/auth/` ou `src/features/subscriber/`.
  **Onde NÃO mexer:** `PagamentoCheckout.tsx` / `ComprovantePagamento.tsx` (já prontos, só consumir resultado).
  **Segurança:** o link precisa de token aleatório, nunca só `?email=...`.

  ---

  ### Task 3 — Treino do aluno sem personal (depende da Task 1)
  **Requisito:** `docs/requisitos/aluno/treino-semana-selecao-exercicio.md` (RF-ALU-02/03/04/05).
  **O que fazer:** estender `Treino` (`src/types/treino.ts`) pra suportar dia da semana e referência ao catálogo (Task 1), seguindo D15/D16. Criar telas do aluno: lista dos 7 dias com exercício escolhido em cada, lista de exercícios filtrável por grupo muscular, tela de detalhe do exercício, ação de selecionar exercício pra um dia.
  **Onde mexer:** `src/types/treino.ts` (avisar o grupo antes de mudar), `src/data/treinoRepository.ts`, telas novas em `src/features/subscriber/`.
  **Onde NÃO mexer:** `src/features/professional/` (fluxo do personal é D15/Task 10, não esta task) e `src/types/exercicio.ts` (consumir, não redefinir).

  ---

  ### Task 4 — Objetivo do aluno e recomendação de exercício (depende da Task 1)
  **Requisito:** `docs/requisitos/aluno/avaliacao-fisica-objetivos-recomendacao.md` (RF-ALU-06/07/08).
  **O que fazer:** implementar D17 e D18. Entidade nova (`ObjetivoAluno` ou equivalente), repository novo, telas novas em `src/features/subscriber/`. Ajustar `Meta.profissionalId` conforme D18 (`Meta` hoje não é consumida por tela nenhuma, ajuste é seguro).
  **Onde mexer:** type novo, `src/types/meta.ts` (só o campo `profissionalId`), repository novo, telas novas em `src/features/subscriber/`.
  **Onde NÃO mexer:** `src/types/avaliacaoFisica.ts` (não alterar a entidade em si — isso é Task 13).
  **Coordenação:** combinar formato de `grupoMuscular` com quem fizer a Task 3, mesmo catálogo (Task 1).

  ---

  ### Task 5 — Dashboard do atendente: busca, consulta, edição e cancelamento
  **Requisito:** `docs/requisitos/atendente/gestao-busca-consulta-edicao-cancelamento.md` (RF-ATD-10/11).
  **O que fazer:** `AttendantDashboardPage.tsx` hoje é só placeholder — criar de fato: busca de aluno por nome/CPF, acesso rápido às ações (cadastro, check-in, pagamento), edição de dados do aluno já cadastrado, e cancelamento de matrícula. CPF não é editável (identificador imutável). Cancelamento marca `status: 'cancelled'` e bloqueia acesso a partir da data de cancelamento.
**Onde mexer:** `src/features/attendant/AttendantDashboardPage.tsx`, telas de edição/cancelamento (podem ficar na mesma pasta `attendant/`).
**Onde NÃO mexer:** `src/types/aluno.ts` (o `status` já existe, sem campo novo).

---

### Task 6 — Fundação: motor de cobrança automática e inadimplência (bloqueia Tasks 9 e 14)
**Requisito:** `docs/requisitos/fundacao/motor-cobranca-inadimplencia.md` (RF-FUND-02).
**O que fazer:** implementar D1, D3, D4, D5, D7. Gerar `Pagamento` automaticamente quando o ciclo do `Atendimento`/`Plano` ativo vira (mensal), lendo o `Plano.price` vigente naquele momento (+ `Atendimento.value` se tiver personal — ver Task 12). Calcular/atualizar `status` (`pending`→`late`) comparando hoje com `dueDate`, aplicando a carência de 5 dias (D4). Expor função simples (ex: `alunoEstaInadimplente(alunoId)`) pra `AttendantCheckinPage.tsx` bloquear o check-in usando a mensagem `latePayment` que já existe sem uso.
**Onde mexer:** `src/data/pagamentoService.ts` ou novo `src/data/cobrancaService.ts`, `AttendantCheckinPage.tsx` (só consumir a função).
**Onde NÃO mexer:** `processarPagamento` (já funciona); não implementar `lateFee` (D5).

---

### Task 7 — Admin: gestão de planos
**Requisito:** `docs/requisitos/distribuicao/gestao-planos.md` (RF-ADM-01).
**O que fazer:** tela de listagem, criação e edição de `Plano` (nome, preço, modalidades, condições, origem/parceiro), em `/admin/planos` (path já previsto no Sidebar). Confere visualmente que mudar preço não altera pagamento já gerado (isso é garantido pela Task 6, não lógica nova aqui).
**Onde mexer:** `src/features/admin/` (telas novas), consumir `planoRepository.ts`.
**Onde NÃO mexer:** não criar plano "descontinuado" (D2).

---

### Task 8 — Admin: cadastro e gestão de funcionários (RH)
**Requisito:** `docs/requisitos/distribuicao/cadastro-funcionarios-rh.md` (RF-ADM-02/03).
**O que fazer:** implementar D9 — estender `Atendente` e `Profissional` com os campos de RH, criar telas de cadastro/edição/listagem em `/admin/profissionais` (path já previsto no Sidebar; incluir também atendentes nessa gestão, ou criar sub-rota equivalente — decidir com o grupo qual URL usar pra atendente se precisar de uma separada).
**Onde mexer:** `src/types/atendente.ts`, `src/types/profissional.ts`, `atendenteRepository.ts`, `profissionalRepository.ts`, telas novas em `src/features/admin/`.
**Onde NÃO mexer:** não criar módulo de contas a pagar/folha (D10) — só cadastro.

---

### Task 9 — Admin: dashboard financeiro (depende da Task 6)
**Requisito:** `docs/requisitos/distribuicao/dashboard-financeiro.md` (RF-ADM-04/05/06/07).
**O que fazer:** substituir o placeholder de `AdminDashboardPage.tsx` por: receita do mês por competência (D3), lista de inadimplentes com dias de atraso (D4), alunos ativos, aniversariantes do mês. Path `/admin` (já existe) ou `/admin/financeiro` (já previsto no Sidebar) pra uma visão financeira mais detalhada — decidir com o grupo se divide em duas telas ou uma só.
**Onde mexer:** `src/features/admin/AdminDashboardPage.tsx`, possivelmente `src/features/financial/` pra lógica de agregação compartilhável.
**Onde NÃO mexer:** não implementar geração/cálculo de pagamento aqui (é a Task 6) — esta task só consome.

---

### Task 10 — Profissional: dashboard e alunos vinculados (depende da Task 11)
**Requisito:** `docs/requisitos/profissional/dashboard-alunos-vinculados.md` (RF-PRO-01/02).
**O que fazer:** substituir o placeholder de `ProfessionalDashboardPage.tsx` por lista dos alunos com `Atendimento` tipo `personal` vinculados a esse profissional (D11), mostrando a agenda (Task 11) junto. Preparar link pra lançar avaliação física (Task 13) de cada aluno.
**Onde mexer:** `ProfessionalDashboardPage.tsx` e telas novas na mesma pasta.
**Onde NÃO mexer:** não montar a vitrine de contratação aqui — isso é visão do aluno (Task 12).

---

### Task 11 — Fundação: agenda semanal do profissional (bloqueia Tasks 10 e 12)
**Requisito:** `docs/requisitos/fundacao/agenda-semanal-profissional.md` (RF-FUND-03).
**O que fazer:** implementar D13/D14 — entidade nova (ex: `src/types/agendaProfissional.ts`) com grade semanal recorrente (dia da semana + horário início/fim), editável pelo próprio profissional. Repository novo e tela de edição em `src/features/professional/`.
**Onde mexer:** type novo, repository novo, tela nova em `src/features/professional/`.
**Onde NÃO mexer:** não implementar bloqueio de data pontual (férias/falta) — fora de escopo (D13).

---

### Task 12 — Aluno standard: vitrine de personal trainers e contratação (depende da Task 11)
**Requisito:** `docs/requisitos/aluno/vitrine-contratacao-personal.md` (RF-ALU-09).
**O que fazer:** implementar D11/D12 — tela pro aluno `standard` ver os personal trainers disponíveis (nome, especialização, agenda da Task 11) e contratar um, criando/atualizando o `Atendimento` (`type: 'personal'`, `profissionalId`, `value`). O valor extra entra no próximo `Pagamento` da Task 6.
**Onde mexer:** telas novas em `src/features/subscriber/`, consumir `atendimentoRepository.ts` e a agenda da Task 11.
**Onde NÃO mexer:** não criar fluxo de pagamento separado pra contratação — é tudo via o `Pagamento` normal (D12).

---

### Task 13 — Avaliação física: avaliação principal e mensais
**Requisitos:** `docs/requisitos/profissional/lancamento-avaliacao-fisica.md` (RF-PRO-03) + `docs/requisitos/aluno/evolucao-fisica-visualizacao.md` (RF-ALU-10).
**O que fazer:** implementar D19 — campo de tipo em `AvaliacaoFisica` (ex: `tipo: 'principal' | 'mensal'`). Tela do profissional pra lançar (principal na primeira vez, mensal depois) e tela do aluno pra visualizar evolução, path `/aluno/evolucao` (já previsto no Sidebar).
**Onde mexer:** `src/types/avaliacaoFisica.ts`, `avaliacaoFisicaRepository.ts`, telas novas em `src/features/professional/` (lançar) e `src/features/subscriber/` (visualizar).
**Onde NÃO mexer:** não criar entidade nova (D19/D17 — mesma lógica que já levou a não duplicar `Meta`/`ObjetivoAluno`).

---

### Task 14 — Aluno: dashboard geral e pagamento dentro do app (depende da Task 6)
**Requisito:** `docs/requisitos/aluno/dashboard-geral-pagamento-app.md` (RF-ALU-11/12/13).
**O que fazer:** implementar D7 — substituir o placeholder de `SubscriberDashboardPage.tsx` por: próximo pagamento (pending/late, da Task 6), treino do dia (se a Task 3 já estiver pronta), meta ativa. Botão de pagar o `Pagamento` pendente dentro do app, reaproveitando o checkout simulado já usado pelo atendente. Path `/aluno/financeiro` (já previsto no Sidebar) pra extrato/histórico, e `/aluno` pro resumo.
**Onde mexer:** `SubscriberDashboardPage.tsx`, reaproveitar `pagamentoService.ts` / componente de checkout já usado pelo atendente.
**Onde NÃO mexer:** não implementar gateway real nem geração de pagamento aqui (é a Task 6) — esta task só consome e deixa o aluno pagar.
