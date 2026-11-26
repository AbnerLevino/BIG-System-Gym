# Módulo 5 — Aluno: Conta e Treino

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Contrato que este módulo consome:** catálogo de exercícios (Módulo 1 — Fundação).

## Checklist

- [ ] **RF-ALU-01 — Criação de senha (ativação de conta)**

  **Descrição:** ao abrir o link do convite recebido do atendente (Módulo 2), o aluno deve conseguir definir a própria senha e acessar o sistema, direto pelo celular. Esse requisito é a segunda metade de um fluxo de dois passos, intencionalmente separado: o atendente fecha a matrícula e o pagamento (lado dele); o aluno, depois, sozinho, cria a própria credencial (lado dele). Nenhum atendente vê ou define a senha do aluno.

  **Critério de aceite:**
  - Dado que o token do link é válido e não expirado, quando o aluno define uma senha, então a conta passa a aceitar login normal e o token é invalidado (uso único).
  - Dado que o token está expirado ou já foi usado, quando o aluno abre o link, então o sistema mostra erro e orienta a pedir novo convite ao atendente.

- [ ] **RF-ALU-02/03/04/05 — Treino: visualização por dia da semana e seleção de exercício**

  **Descrição:** o aluno deve conseguir: (1) visualizar os dias da semana (incluindo finais de semana) com o exercício selecionado para cada dia; (2) listar exercícios disponíveis, filtrados por grupo muscular (catálogo do Módulo 1); (3) visualizar o detalhe de um exercício (nome, descrição, nível de dificuldade, vídeo-aula); (4) selecionar um exercício e associá-lo a um dia específico da semana.

  **Nota técnica — gap real no modelo de dado atual:** o `Treino` hoje (`src/types/treino.ts`) é uma lista plana de exercícios por semana (`{name, sets, reps}`), sem campo de dia da semana, grupo muscular, dificuldade ou vídeo, e é criado pelo `Atendimento` (profissional), não pelo aluno. Este requisito exige extensão real do modelo antes de implementar — não é só tela nova.

  **⚠️ Decisão aberta — resolver com o grupo antes de codar:** o aluno escolhe livremente qualquer exercício pra qualquer dia, ou escolhe dentro de uma grade pré-montada por um profissional? Isso muda a modelagem: se houver grade, o `Treino` continua pertencendo ao profissional e o aluno só seleciona dentro do que foi liberado; se for livre, o aluno passa a ser autor do próprio treino. Hoje o `Treino` já é criado pelo profissional — este requisito precisa decidir se substitui, complementa ou convive com isso antes de implementar.

  **Critério de aceite:**
  - Dado que o aluno está vendo o detalhe de um exercício, quando seleciona um dia da semana, então o exercício passa a aparecer no treino daquele dia.

- [ ] **RF-ALU-06/07/08 — Avaliação física: objetivos, metas e recomendação de exercício**

  **Descrição:** o aluno deve conseguir: (1) responder um questionário sobre objetivo (ex: perder peso, ganhar massa) e definir uma meta; (2) selecionar um ou mais grupos musculares que deseja melhorar (seleção múltipla); (3) visualizar os exercícios correspondentes aos grupos selecionados, com nome, descrição e dificuldade.

  **Nota técnica — conflito de nome com o que já existe:** já existe uma entidade `AvaliacaoFisica` no sistema (`src/types/avaliacaoFisica.ts`), mas ela representa outra coisa: um registro de medidas corporais feito pelo profissional, não um questionário de objetivos respondido pelo próprio aluno. São dois conceitos diferentes com nome parecido — a entidade nova deste item precisa de nome distinto (ex: `ObjetivoAluno`), **não reaproveitar nem `AvaliacaoFisica.objective` nem `Meta`** (`src/types/meta.ts` — isso é alvo numérico com prazo, outro conceito).

  **⚠️ Decisão aberta — resolver com o grupo antes de codar:** qual é a regra exata de correspondência entre objetivo/grupo muscular selecionado e exercício recomendado? Hoje está descrito como "mostra os exercícios correspondentes" — precisa virar uma regra explícita (tabela exercício → grupo muscular → nível recomendado por objetivo) antes de implementar. Isso é o motor de recomendação do sistema, não uma tela simples de listagem.

  **Ajuste correlato em `Meta`:** `Meta.profissionalId` hoje é obrigatório, com comentário dizendo que só existe para vínculo `personal`. Isso está errado — `Meta` vale pra qualquer aluno, com ou sem personal; o que muda é o acompanhamento. Trocar pra `profissionalId?: string` (presente só quando um personal acompanha ativamente). Quando não há personal, o status da `Meta` (`inProgress`/`completed`/`late`) é calculado automaticamente pelo sistema — frequência compara com os `CheckIn`s do aluno, peso compara com a `AvaliacaoFisica` mais recente. `Meta` hoje não é consumida por nenhuma tela ainda, então esse ajuste é seguro.

  **Onde NÃO mexer:** `src/types/avaliacaoFisica.ts` em si (não alterar a entidade existente).

  **Critério de aceite:**
  - Seleção de grupo muscular permite múltipla escolha simultânea.
  - Lista de exercícios recomendados é a união dos exercícios de todos os grupos selecionados, sem duplicar exercício que pertence a mais de um grupo.
