# Distribuição de tasks — módulo Aluno + pendências do Atendente

**Data:** 2026-10-25
**Para quem é esse doc:** quem for pegar uma dessas tasks. Isso **não é o requisito completo** — é o ponto de partida: o que fazer, onde pode mexer, onde não pode, e o que já foi decidido (pra não ficar em dúvida ou inventar uma regra diferente do que já foi combinado). Antes de implementar de verdade, leia o requisito completo linkado em cada task.

## Regras que valem pra todas as tasks abaixo

- **Branch:** `feature/<area>-<descricao-curta>` a partir da `main` atualizada. Ver `CONTRIBUTING.md`.
- **Uma feature nunca importa de dentro de outra feature** (ex: algo em `features/subscriber` não importa de `features/attendant`, e vice-versa). Se precisar de algo de outra feature, avise antes de duplicar código.
- **Nomes de entidade/tipo/função de negócio em português** (ex: `Treino`, `obterAlunoPorId`). Pastas estruturais (`types`, `data`, `store`, `components`, `features`, `routes`) ficam em inglês.
- Não existe suíte de teste automatizada neste projeto. Ciclo de verificação: `npm run typecheck` (sem erro) + conferir visualmente no navegador (`npm run dev`) antes de comitar.
- Se a sua task pedir campo novo numa entidade que já existe (`types/*.ts`), avise o grupo antes de mudar — outra parte do sistema pode já depender do formato atual.
- Commits em português, pequenos e frequentes (`feat: ...`, `fix: ...`, `refactor: ...`).

---

## Task 0 — Fundação: catálogo de exercícios

**Status:** bloqueia as Tasks 2 e 3 abaixo — fazer essa primeiro, ou combinar com quem pegar 2 e 3 pra não duplicar o tipo `Exercicio` cada um do seu jeito.

**O que fazer:** criar o catálogo de exercícios que ainda não existe no sistema. Hoje `Treino.exercises` (`src/types/treino.ts`) é só `{name, sets, reps}` — sem grupo muscular, dificuldade, descrição ou vídeo/animação. Precisa de uma entidade nova de catálogo (ex: `src/types/exercicio.ts`) com algo como: nome, descrição, grupo(s) muscular(es), nível de dificuldade, URL de vídeo-aula e URL de animação (gif em loop mostrando o movimento — ver nota de pesquisa abaixo). Mais um repository (`src/data/exercicioRepository.ts`) e um seed inicial com alguns exercícios de exemplo.

**Onde mexer:** `src/types/exercicio.ts` (novo), `src/data/exercicioRepository.ts` (novo), `src/data/seed.ts` (adicionar seed do catálogo).

**Onde NÃO mexer:** `src/types/treino.ts` ainda não — a extensão do `Treino` pra referenciar esse catálogo é da Task 2, não desta.

**Nota de pesquisa — animação do exercício:** já pesquisamos. Pra "boneco" 2D em gif repetindo, existem bancos gratuitos prontos (ex: [ExerciseDB](https://exercisedb.dev/), free tier sem precisar de chave). Essa task guarda só a **URL** da animação no campo do catálogo — não precisa implementar nenhuma geração de animação. Boneco 3D rigado foi avaliado e descartado por ora (sem biblioteca pronta pra isso em React; exigiria trabalho de retargeting de motion capture, fora do escopo de um MVP).

**Decisão já fechada:** não confundir esse catálogo (`Exercicio`) com `Treino.exercises` — o catálogo é "o que existe pra escolher"; `Treino` é "o que foi escolhido pra esse aluno, nesse dia".

---

## Task 1 — Ativação de conta do aluno (sem bloqueio, pode começar já)

**Requisitos:** `docs/requisitos/atendente/ativacao-conta-acesso.md` (RF-ATD-04/05/06/07) + `docs/requisitos/aluno/criacao-senha-ativacao.md` (RF-ALU-01).

**O que fazer:** hoje o atendente cria o `Usuario` do aluno já com senha definida por ele mesmo, no fluxo de cadastro (`src/features/attendant/AttendantCadastroPage.tsx`) — isso está **desalinhado** com o requisito mais novo: a senha nunca deve ser definida pelo atendente, só pelo próprio aluno depois, via link de ativação com token. Essa task corrige isso: ao confirmar o pagamento, o sistema cria o `Usuario` em estado "pendente de senha" com um token de ativação (expira em 48h, uso único). O aluno abre uma tela nova, define a senha, e só aí a conta vira utilizável.

**Onde mexer:** `src/types/usuario.ts` (campos de token/status pendente), `src/data/usuarioRepository.ts` (funções de criar convite / validar token / definir senha), `src/features/attendant/AttendantCadastroPage.tsx` (parar de pedir senha aqui, mostrar o link de ativação simulado na tela — ver nota abaixo), tela nova em `src/features/auth/` ou `src/features/subscriber/` pro aluno abrir o link e definir a senha.

**Onde NÃO mexer:** `src/features/attendant/PagamentoCheckout.tsx` / `ComprovantePagamento.tsx` (já prontos, só consumir o resultado).

**Simulação (sem backend ainda):** não existe envio de e-mail real nessa fase. Mostrar o link de ativação direto na tela do atendente, deixando explícito que é simulado — igual já é feito com os atalhos de demo do login.

**Segurança — não esquecer:** o link tem que carregar um token aleatório, nunca só `?email=...` — senão qualquer pessoa que souber o e-mail de um aluno conseguiria criar a senha da conta dele.

---

## Task 2 — Treino do aluno sem personal (depende da Task 0)

**Requisito:** `docs/requisitos/aluno/treino-semana-selecao-exercicio.md` (RF-ALU-02/03/04/05).

**Decisão já fechada (não é mais questão aberta):** o vínculo aluno↔profissional já existe no modelo (`Atendimento.type: 'standard' | 'personal'`, `src/types/atendimento.ts`). A regra é:
- Aluno com `Atendimento` ativo tipo `'personal'` → o profissional continua montando o treino (fluxo atual, **não mexer** nisso).
- Aluno só com vínculo `'standard'` (sem personal) → o aluno monta a própria grade, escolhendo exercícios do catálogo (Task 0) pra cada dia da semana.

**O que fazer:** estender `Treino` (`src/types/treino.ts`) pra suportar dia da semana e referência ao catálogo de exercícios (Task 0). Criar as telas do aluno: lista dos 7 dias da semana com o exercício escolhido em cada, lista de exercícios filtrável por grupo muscular, tela de detalhe do exercício (nome, descrição, dificuldade, vídeo, animação), e a ação de selecionar um exercício pra um dia.

**Onde mexer:** `src/types/treino.ts` (extensão — avisar o grupo antes, ver regra geral), `src/data/treinoRepository.ts`, telas novas em `src/features/subscriber/`.

**Onde NÃO mexer:** `src/features/professional/` (o fluxo de treino montado pelo personal não muda nessa task) e `src/types/exercicio.ts` (consumir o que a Task 0 criar, não redefinir).

---

## Task 3 — Objetivo do aluno e recomendação de exercício (depende da Task 0)

**Requisito:** `docs/requisitos/aluno/avaliacao-fisica-objetivos-recomendacao.md` (RF-ALU-06/07/08).

**Decisão já fechada (não é mais questão aberta):**
1. **Modelo:** `Objetivo` (perder peso | ganhar peso | ganhar músculo | definição) → cada objetivo associa a um conjunto de grupos musculares → aluno seleciona 1+ grupos musculares (multi-select) → lista de exercícios recomendados é a união dos exercícios desses grupos (sem duplicar), vindos do catálogo da Task 0.
2. **Essa entidade é nova** (ex: `ObjetivoAluno`), e **não pode reaproveitar nem `AvaliacaoFisica.objective`** (`src/types/avaliacaoFisica.ts` — isso é medida corporal feita pelo profissional, outro conceito) **nem `Meta`** (`src/types/meta.ts` — isso é alvo numérico com prazo, outro conceito). São três coisas parecidas no nome, diferentes na prática — manter nomes distintos é o que evita bug de confundir uma com a outra.
3. **Ajuste correlato em `Meta`:** `Meta.profissionalId` hoje é obrigatório, com comentário dizendo que só existe para vínculo `personal`. Isso estava errado — `Meta` vale pra qualquer aluno, com ou sem personal; o que muda é o acompanhamento. Troque pra `profissionalId?: string` (presente só quando um personal acompanha ativamente). **Quando não há personal, o status da `Meta` (`inProgress`/`completed`/`late`) é calculado automaticamente pelo sistema** — frequência compara com os `CheckIn`s do aluno, peso compara com a `AvaliacaoFisica` mais recente — sem precisar de humano atualizando status manualmente. `Meta` hoje não é consumida por nenhuma tela ainda, então esse ajuste é seguro (não quebra nada existente).

**Onde mexer:** novo type (`ObjetivoAluno` ou nome equivalente, mas **não** `AvaliacaoFisica` nem `Meta`), `src/types/meta.ts` (só o campo `profissionalId`, ver acima), repository novo, telas novas em `src/features/subscriber/`.

**Onde NÃO mexer:** `src/types/avaliacaoFisica.ts` em si (não alterar a entidade existente).

**Coordenação com a Task 2:** as duas tasks consomem o mesmo catálogo de exercícios (Task 0) — combinem o formato de `grupoMuscular` (os mesmos nomes/valores) antes de cada um sair implementando separado.

---

## Task 4 — Edição e cancelamento de aluno (sem bloqueio)

**Requisito:** `docs/requisitos/atendente/gestao-busca-consulta-edicao-cancelamento.md` (RF-ATD-10/11 — pesquisa e consulta já estão prontas).

**O que fazer:** confirmar no código atual de `src/features/attendant/` se editar dados de um aluno já cadastrado e cancelar matrícula já funcionam de ponta a ponta. Se não, implementar. CPF não é editável (identificador imutável). Cancelamento marca a matrícula como `cancelled` e bloqueia o acesso do aluno a partir da data de cancelamento.

**Onde mexer:** `src/features/attendant/` (telas existentes de busca/consulta).

**Onde NÃO mexer:** `src/types/aluno.ts` (o `status: 'trial' | 'active' | 'cancelled'` já existe, não precisa de campo novo).
