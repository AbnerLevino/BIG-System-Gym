# Módulo 1 — Fundação

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Por que esse módulo existe:** são as 3 peças que os outros módulos consomem. Quem pegar este módulo não depende de ninguém — mas os módulos 2, 3, 5 e 6 dependem dele. Prioridade: comece primeiro, ou pelo menos combine os nomes de função/formato de dado abaixo com quem for pegar os módulos dependentes, pra eles não ficarem travados esperando o PR terminar — podem já codar contra o contrato.

**Contrato que este módulo fornece:**
- `exercicioRepository.ts` → `obterExercicios()`, `obterExercicioPorId(id)`, `obterExerciciosPorGrupoMuscular(grupo)`.
- Função `alunoEstaInadimplente(alunoId): boolean`.
- `agendaProfissionalRepository.ts` → agenda semanal do profissional logado.

## Checklist

- [ ] **RF-FUND-01 — Catálogo de exercícios**

  **Descrição:** criar o catálogo de exercícios que ainda não existe de fato. Hoje `Treino.exercises` é só `{name, sets, reps}`, sem grupo muscular, dificuldade, descrição ou vídeo/animação. O catálogo é "o que existe pra escolher"; `Treino` é "o que foi escolhido pra esse aluno, nesse dia" — **não confundir os dois conceitos.**

  **Entidade (`src/types/exercicio.ts`, já definida):**
  ```ts
  export type GrupoMuscular = 'peito' | 'costas' | 'ombro' | 'braco' | 'abdomen' | 'perna'
  export type NivelDificuldadeExercicio = 'iniciante' | 'intermediario' | 'avancado'

  export interface Exercicio {
    id: string
    nome: string
    descricao: string
    grupoMuscular: GrupoMuscular
    nivelDificuldade: NivelDificuldadeExercicio
    equipamento: string
    videoUrl?: string
    animacaoUrl?: string
  }
  ```

  **Onde mexer:**
  - `src/data/exercicioRepository.ts` (novo) — seguir o padrão: `inicializarExercicios()`, `obterExercicios()`, `obterExercicioPorId(id)`, `obterExerciciosPorGrupoMuscular(grupo)`.
  - `src/data/seed.ts` — seed de exemplo cobrindo os 6 valores de `GrupoMuscular`.
  - `src/data/index.ts` — export do novo repository + registrar `inicializarExercicios()` dentro de `inicializarTodosOsDados()`.
  - `src/features/subscriber/SubscriberTreinoPage.tsx` — trocar o array mockado (`exerciciosMock`) por dados vindos de `obterExercicios()`.

  **Onde NÃO mexer:**
  - `src/types/treino.ts` — não é escopo deste item (é tratado no Módulo 5).

  **Critério de aceite:**
  - `exercicioRepository.ts` segue exatamente o padrão dos outros repositories (ver `planoRepository.ts` como referência).
  - Seed cobre pelo menos um exercício por `GrupoMuscular` (peito, costas, ombro, braco, abdomen, perna).
  - `animacaoUrl`/`videoUrl` guardam só a URL (ex: bancos gratuitos como ExerciseDB) — não implementar geração ou upload de animação nesta task.
  - `SubscriberTreinoPage.tsx` deixa de depender do array mockado e passa a ler do repository.

  **Nota:** `grupoMuscular` já é um enum fechado (`GrupoMuscular`) — quem implementar os itens de treino e de recomendação (Módulo 5) reaproveita esse mesmo tipo, não cria um formato próprio de grupo muscular em paralelo.

- [ ] **RF-FUND-02 — Motor de cobrança automática e inadimplência**

  **Descrição:** motor que gera `Pagamento` automaticamente a cada virada de ciclo mensal do `Atendimento`/`Plano` ativo de um aluno, e calcula/atualiza o `status` desse pagamento ao longo do tempo, aplicando a carência e o bloqueio por inadimplência (D1, D3, D4, D5, D7 — ver `00-contexto-mestre.md`). Hoje `Pagamento` já tem `dueDate`/`status`/`lateFee` no type, mas a geração automática não existe — só a aprovação simulada em `pagamentoService.ts`.

  **Onde mexer:**
  - `src/data/pagamentoService.ts` ou um novo `src/data/cobrancaService.ts`.
  - `AttendantCheckinPage.tsx` — só consumir a função de verificação (a mensagem `latePayment` já existe reservada, sem uso).

  **Onde NÃO mexer:**
  - `processarPagamento` (já funciona, fluxo de aprovação simulada não muda).
  - Não implementar cálculo de `lateFee` (D5).

  **Critério de aceite:**
  - Dado que o ciclo mensal do `Atendimento`/`Plano` ativo vira, quando o motor roda, então um novo `Pagamento` é criado com `originalValue` = `Plano.price` vigente (+ `Atendimento.value` se `type: 'personal'`) e `status: 'pending'`.
  - Dado que um `Pagamento` passa de `dueDate` + 5 dias corridos sem `paidValue`, quando o motor avalia o status, então `status` vira `'late'`.
  - Função exposta (ex: `alunoEstaInadimplente(alunoId)`) retorna `true` a partir do 6º dia sem pagamento.
  - Alterar `Plano.price` depois de um `Pagamento` já gerado não altera o `originalValue` desse pagamento.
  - Nenhuma cobrança extra (multa) é gerada por atraso.

- [ ] **RF-FUND-03 — Agenda semanal recorrente do profissional**

  **Descrição:** entidade nova de agenda do profissional, em grade **semanal recorrente** (dia da semana + horário de início/fim, repete toda semana), editável somente pelo próprio profissional (D13, D14).

  **Onde mexer:**
  - `src/types/agendaProfissional.ts` (novo) — ex: `{ id, profissionalId, diaSemana, horaInicio, horaFim }`.
  - Repository novo (`src/data/agendaProfissionalRepository.ts`), seguindo o padrão de `inicializar*`/`obter*`/`salvar*`.
  - Tela de edição nova em `src/features/professional/`.
  - `src/data/index.ts` — export + registro em `inicializarTodosOsDados()`.

  **Critério de aceite:**
  - Profissional logado só edita a própria agenda (`agendaProfissional.profissionalId` precisa corresponder ao `refId` do `Usuario` logado) — travar isso na tela, não confiar em escolha livre de profissional na UI.
  - Grade é recorrente: um item de agenda vale pra todas as semanas, sem data específica.
  - Não existe campo ou fluxo de bloqueio pontual (férias, falta, data específica) nesta rodada.
