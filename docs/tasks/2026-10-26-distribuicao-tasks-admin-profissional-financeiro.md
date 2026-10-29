# Distribuição de tasks — Admin, Profissional, Financeiro e ajustes do Atendente

**Data:** 2026-10-26
**Para quem é esse doc:** quem for pegar uma dessas tasks. Igual ao doc anterior (`2026-10-25-distribuicao-tasks-aluno.md`): isso não é o requisito completo, é o ponto de partida. As regras abaixo foram fechadas em conversa direta com o responsável do projeto — **não reabrir essas decisões sem avisar o grupo**, só refinar detalhe de implementação.

**Nota:** `admin` e `professional` não têm requisito formal em `docs/requisitos/` ainda (só existem os placeholders de dashboard no código, com uma dica do que cada um devia conter). As regras de negócio abaixo nasceram direto da conversa — se o grupo achar importante, formalizar depois em `docs/requisitos/admin/` e `docs/requisitos/professional/`.

## Diagnóstico rápido do que já existe (antes de alguém reinventar)

- `Pagamento` já tem `dueDate`, `status: pending/paid/late` e `lateFee` — o comentário no type já dizia "gerado automaticamente a partir do plano vigente, nunca lançado manualmente". **A geração automática não existe ainda**, só a aprovação (`processarPagamento` em `pagamentoService.ts`).
- `AttendantCheckinPage.tsx` já tem a string `latePayment: 'Acesso bloqueado: pagamento atrasado.'` reservada, mas não usada — o bloqueio não está implementado.
- A Task 4 do doc anterior (`2026-10-25-...`) parte da premissa de que busca/consulta de aluno "já estão prontas" — **não estão**. `AttendantDashboardPage.tsx` é só um placeholder. Isso virou a Task 14 abaixo.
- `treinoRepository.ts` existe mas não é consumido em nenhuma tela — o "fluxo atual do personal montando treino" citado no doc anterior não existe de fato ainda.

## Regras gerais (as mesmas do doc anterior)

- Branch: `feature/<area>-<descricao-curta>` a partir da `main` atualizada.
- Uma feature nunca importa de dentro de outra feature.
- Nomes de entidade/tipo/função de negócio em português; pastas estruturais em inglês.
- Sem suíte de teste automatizada: `npm run typecheck` + conferir no navegador antes de comitar.
- Campo novo em entidade que já existe → avisar o grupo antes.
- Commits em português, pequenos e frequentes.

---

## Decisões já fechadas (valem pra todas as tasks abaixo)

1. **Preço de plano:** alterar o valor de um `Plano` só afeta pagamentos gerados a partir daquele momento. Matrícula/pagamento já gerado mantém o valor antigo. Isso já cai de graça da modelagem atual (`Pagamento.originalValue` é congelado por registro) — não precisa de lógica extra de "congelamento", só garantir que a geração automática (Task 5) sempre lê o `Plano.price` vigente **no momento da geração**, nunca recalcula pagamento já existente.
2. **Sem plano "descontinuado"** — não implementar esse conceito.
3. **Receita do Admin é por competência:** pagamento conta no mês do `dueDate` (vencimento), não no mês em que foi de fato pago. Ex: mensalidade de outubro paga em novembro conta como receita de outubro.
4. **Inadimplência:** vencimento sem pagamento → carência de **5 dias corridos** → a partir do 6º dia sem pagamento, check-in bloqueado. Dashboard do Admin mostra também quantos dias cada aluno está em atraso.
5. **Sem multa por atraso.** A assinatura que passa do vencimento **não gera cobrança extra** — a única consequência é a catraca/check-in ficar bloqueado (decisão 4) até o aluno pagar de novo. `Pagamento.lateFee` existe no type mas não é usado por regra de negócio nenhuma; não implementar cálculo de multa. (Correção de uma proposta anterior nesta conversa que sugeria multa configurável — descartada.)
6. **Backend e gateway de pagamento real continuam fora de escopo agora** — tudo simulado, igual já é feito em `pagamentoService.ts`.
7. **Funcionário (Atendente + Profissional):** cadastro completo precisa de nome completo, CPF, RG, endereço, telefone, contato de emergência, dados bancários, tipo de contratação, cargo/função, data de admissão, valor de salário, e CREF (só em `Profissional`, campo opcional). E-mail de login já existe via `Usuario.email` — **não duplicar**, a menos que surja necessidade real de e-mail de contato diferente do e-mail de login.
8. **Contas a pagar (salário + despesas da academia):** fora de escopo por agora. Essa rodada cobre só o cadastro de dados do funcionário. Financeiro de despesas vira task futura, com levantamento de regra próprio (categoria de despesa, recorrência, quem lança/aprova).
9. **Vínculo aluno-profissional (Professional):**
   - Aluno com `Atendimento` tipo `personal` já vinculado → vê **só** aquele profissional.
   - Aluno `standard` (sem personal) → vê uma vitrine com os personal trainers disponíveis na academia, pra contratar.
   - Contratar um personal gera/atualiza o `Atendimento` do aluno pra `type: 'personal'`, com `profissionalId` e `value` (o extra cobrado) — isso entra no próximo `Pagamento` gerado automaticamente (Task 5), junto com a mensalidade normal. **Não é uma cobrança separada** — o personal é "da academia", não um terceiro autônomo.
   - Agenda do personal: **grade semanal recorrente** (dia da semana + horário início/fim, repete toda semana). Sem bloqueio de data pontual (férias, falta) nesta rodada.
   - Quem edita a agenda: **o próprio profissional**, não o admin.
10. **Avaliação física:** profissional lança uma avaliação **principal** e avaliações **mensais** de acompanhamento (frequência/progresso). São o mesmo tipo de entidade (`AvaliacaoFisica`), diferenciadas por um campo de tipo — não criar entidade nova pra isso.
11. **Cobrança automática do aluno (dashboard do Subscriber):** sim, construir — mas simulada, sem backend real. O sistema gera o próximo `Pagamento` automaticamente (Task 5) e o aluno paga **dentro do app**, reaproveitando o mesmo fluxo simulado (`processarPagamento` / componente de checkout) que o atendente já usa no balcão.

---

## Task 5 — Fundação: motor de cobrança automática, inadimplência e multa (bloqueia Tasks 8 e 13)

**O que fazer:** criar a lógica que hoje só existe como comentário/campo solto:
- Gerar `Pagamento` automaticamente quando o ciclo do `Atendimento`/`Plano` ativo de um aluno vira (mensal), lendo o `Plano.price` vigente naquele momento (ver decisão 1) + o `Atendimento.value` se o aluno tiver personal (ver decisão 9).
- Calcular/atualizar `status` (`pending` → `late`) comparando a data de hoje com `dueDate`, aplicando a carência de 5 dias (decisão 4).
- Expor uma função simples (ex: `alunoEstaInadimplente(alunoId)` ou similar) que `AttendantCheckinPage.tsx` possa chamar pra bloquear o check-in usando a mensagem `latePayment` que já existe e está sem uso.

**Onde mexer:** `src/data/pagamentoService.ts` ou um novo `src/data/cobrancaService.ts`, `src/features/attendant/AttendantCheckinPage.tsx` (só pra consumir a função de verificação, usar a mensagem já existente).

**Onde NÃO mexer:** `processarPagamento` (aprovação simulada já funciona, não precisa mudar); não implementar cálculo de multa (`lateFee`) — decisão 5.

---

## Task 6 — Admin: gestão de planos

**O que fazer:** tela de listagem, criação e edição de `Plano` (nome, preço, modalidades, condições, origem/parceiro). Confirma visualmente que mudar o preço não altera pagamento já gerado (isso é garantido pela Task 5, não por lógica nova aqui).

**Onde mexer:** `src/features/admin/` (telas novas), consumir `planoRepository.ts` (já existe).

**Onde NÃO mexer:** não criar conceito de plano descontinuado (decisão 2).

---

## Task 7 — Admin: cadastro e gestão de funcionários (RH)

**O que fazer:** estender `Atendente` e `Profissional` (`src/types/atendente.ts`, `src/types/profissional.ts`) com os campos de RH da decisão 7 (RG, endereço, contato de emergência, dados bancários, tipo de contratação, data de admissão, salário; CREF só em `Profissional`, opcional). Criar telas de cadastro/edição/listagem no Admin pra ambos.

**Onde mexer:** os dois types acima, `atendenteRepository.ts`, `profissionalRepository.ts`, telas novas em `src/features/admin/`.

**Onde NÃO mexer:** não criar módulo de contas a pagar/folha nesta task (decisão 8) — só o cadastro.

---

## Task 8 — Admin: dashboard financeiro (depende da Task 5)

**O que fazer:** substituir o placeholder de `AdminDashboardPage.tsx` por: receita do mês por competência (decisão 3), lista de inadimplentes com dias de atraso (decisão 4), contagem de alunos ativos, aniversariantes do mês.

**Onde mexer:** `src/features/admin/AdminDashboardPage.tsx`, possivelmente um `src/features/financial/` pra lógica de agregação compartilhável.

**Onde NÃO mexer:** não implementar geração/cálculo de pagamento aqui — isso é a Task 5, esta task só consome.

---

## Task 9 — Profissional: dashboard e alunos vinculados

**O que fazer:** substituir o placeholder de `ProfessionalDashboardPage.tsx` por uma lista dos alunos com `Atendimento` tipo `personal` vinculados a esse profissional (decisão 9). Preparar a tela pra eventualmente linkar pra avaliação física (Task 12) de cada aluno.

**Onde mexer:** `src/features/professional/ProfessionalDashboardPage.tsx` e telas novas na mesma pasta.

**Onde NÃO mexer:** não montar a vitrine de contratação aqui (isso é visão do aluno, Task 11) — essa task é só a visão do profissional sobre os alunos que já tem.

---

## Task 10 — Fundação: agenda semanal do profissional (bloqueia Task 11)

**O que fazer:** criar entidade nova (ex: `src/types/agendaProfissional.ts`) representando a grade semanal recorrente de disponibilidade (dia da semana + horário início/fim), editável pelo próprio profissional (decisão 9). Repository novo e tela de edição em `src/features/professional/`.

**Onde mexer:** type novo, repository novo, tela nova em `src/features/professional/`.

**Onde NÃO mexer:** não implementar bloqueio de data pontual (férias/falta) — fora de escopo nesta rodada.

---

## Task 11 — Aluno standard: vitrine de personal trainers e contratação (depende da Task 10)

**O que fazer:** tela pro aluno `standard` (sem personal) ver os personal trainers disponíveis na academia (nome, especialização, agenda da Task 10) e contratar um — isso cria/atualiza o `Atendimento` do aluno pra `type: 'personal'` com `profissionalId` e `value` (decisão 9). O valor extra entra no próximo `Pagamento` gerado pela Task 5.

**Onde mexer:** telas novas em `src/features/subscriber/`, consumir `atendimentoRepository.ts` e a agenda da Task 10.

**Onde NÃO mexer:** não criar fluxo de pagamento separado pra contratação do personal — é tudo via o `Pagamento` normal (decisão 9).

---

## Task 12 — Avaliação física: avaliação principal e mensais

**O que fazer:** adicionar campo de tipo em `AvaliacaoFisica` (ex: `tipo: 'principal' | 'mensal'`) — mesma entidade, decisão 10. Tela do profissional pra lançar (principal na primeira vez, mensal depois) e tela do aluno pra visualizar a evolução (principal como referência, mensais como progresso).

**Onde mexer:** `src/types/avaliacaoFisica.ts`, `src/data/avaliacaoFisicaRepository.ts`, telas novas em `src/features/professional/` (lançar) e `src/features/subscriber/` (visualizar).

**Onde NÃO mexer:** não criar entidade nova pra isso — é a mesma `AvaliacaoFisica` (decisão 10, mesma lógica que já levou a não duplicar `Meta`/`ObjetivoAluno` no doc anterior).

---

## Task 13 — Aluno: dashboard geral e pagamento dentro do app (depende da Task 5)

**O que fazer:** substituir o placeholder de `SubscriberDashboardPage.tsx` por: próximo pagamento (pending/late, consumindo o que a Task 5 gera), treino do dia (se já existir — depende da Task 2 do doc anterior), meta ativa. Botão de pagar o `Pagamento` pendente direto no app, reaproveitando o fluxo de checkout simulado já existente (decisão 11).

**Onde mexer:** `src/features/subscriber/SubscriberDashboardPage.tsx`, reaproveitar `pagamentoService.ts` / componente de checkout já usado pelo atendente.

**Onde NÃO mexer:** não implementar gateway real nem geração de pagamento aqui — a geração é a Task 5, esta task só consome e deixa o aluno pagar.

---

## Task 14 — Atendente: dashboard real com busca e consulta (corrige a Task 4 do doc anterior)

**O que fazer:** `AttendantDashboardPage.tsx` hoje é placeholder puro, mas a Task 4 do doc anterior assumia que busca/consulta já existiam — não existem. Esta task cria de fato: busca de aluno por nome/CPF, acesso rápido às ações (cadastro, check-in, pagamento), e destrava a edição/cancelamento de aluno que a Task 4 antiga pedia (CPF não editável; cancelamento marca `status: 'cancelled'` e bloqueia acesso a partir da data).

**Onde mexer:** `src/features/attendant/AttendantDashboardPage.tsx`, telas de edição/cancelamento novas ou dentro da própria pasta `attendant/`.

**Onde NÃO mexer:** `src/types/aluno.ts` (o `status` já existe, não precisa de campo novo).
