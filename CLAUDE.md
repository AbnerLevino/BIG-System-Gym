# BigGym — contexto para continuar o trabalho

Sistema de gestão de academia (trabalho de faculdade, apresentação de ~10 min). **Só front-end**: os dados ficam no
`localStorage`, simulando um banco. Quatro papéis: `admin`, `atendente`, `professional`, `subscriber` (aluno).

O backlog oficial está em `plano-de-desenvolvimento/` (`00-contexto-mestre.md` tem as regras fixas D1–D19; um arquivo
por módulo) e os requisitos detalhados em `docs/requisitos/`. **Leia o `00-contexto-mestre.md` antes de codar.**

## Comandos

- `npm run dev` — servidor (use `npm run dev -- --host` para abrir pelo celular na mesma rede).
- `npm run typecheck` — tem que passar com zero erro antes de qualquer commit.
- `npm run build` — build de produção.
- Se uma tela aparecer quebrada sem motivo depois de editar arquivos, reinicie o `npm run dev` (o watcher às vezes
  não percebe a mudança e serve a versão antiga).
- Não há testes automatizados: verificação = typecheck + olhar no navegador.

## Stack e regras de código (não mudar)

React 18 + Vite 5 + TypeScript 5.5, Tailwind 3.4 (só `className`), React Router 6, Zustand 4, lucide-react, jspdf,
qrcode, @vladmandic/face-api.

- **Camadas:** `types` → `data` (um `*Repository.ts` por entidade + `*Service.ts` para regra que cruza entidades) →
  `store` → `components` → `features` (uma pasta por papel) → `routes`.
- **Regra de ouro 1:** tela nunca toca `localStorage`; sempre via funções de `src/data`.
- **Regra de ouro 2:** uma pasta de `features/` nunca importa de outra. O que é compartilhado vai em `components/`
  (ex: `components/payment`, `components/plano`).
- **Regra de ouro 3:** campo novo em entidade existente de `src/types` → avisar o grupo antes.
- **Repository novo:** padrão `inicializarX/obterX/obterXPorId/salvarX`, exportar em `src/data/index.ts` e registrar em
  `inicializarTodosOsDados()`.
- **Tela nova:** rota em `AppRoutes.tsx` com `<ProtectedRoute allowedRole>` **e** item em `NAV_ITEMS` do `Sidebar.tsx`
  (exceto telas abertas por modal ou por link).
- **Idioma:** pastas estruturais e nomes de arquivo em inglês; entidades, funções de negócio, textos de tela, URLs,
  comentários e commits em português.
- **Paleta:** `emerald-700/800` marca; `slate-*` texto/borda; `zinc-*` fundo; `rose/red` perigo; `amber` aviso.
  Títulos usam `font-heading` (Outfit); corpo é Instrument Sans.
- **Dados de seed:** `src/data/seed.ts`. Ao mudar o formato de uma entidade ou o seed de forma incompatível, **suba
  `VERSAO_DOS_DADOS` em `src/data/storage.ts`** — na próxima abertura o navegador descarta os dados antigos e recarrega
  o seed (a sessão de login é mantida). Versão atual: **6**.

## Estado atual por módulo

### Atendente (módulo 2) — requisitos concluídos

| Requisito | Onde |
|---|---|
| Central da Recepção (tela inicial): saudação, 3 indicadores (check-ins hoje, renovações ≤7 dias, pendências), acesso rápido, "Atenção necessária", "Movimentação recente" | `features/attendant/AttendantDashboardPage.tsx` + `data/recepcaoService.ts` |
| ATD-01/02/03 cadastro em etapas, **em modal** (botão "Novo aluno"): Dados → Plano → Acesso → Pagamento → Rosto → Convite. Visita teste: Dados → Rosto → Concluído | `CadastroAlunoFluxo.tsx`, `data/matriculaService.ts` (`matricularAluno`) |
| CPF com dígito verificador + duplicidade, erro no próprio campo, "Gerar CPF de teste (demonstração)" | `utils/validacoes.ts` |
| Face ID opcional + consentimento LGPD separado | `ConsentimentoBiometria.tsx` |
| ATD-04/05/06/07 conta só nasce quando o pagamento é aprovado; atendente informa só o e-mail; aluno confere o e-mail na tela; convite com QR code/link **simulado** (token aleatório, uso único, 48h); corrigir e-mail invalida o token e não duplica usuário | `ConviteAtivacaoPainel.tsx`, `data/ativacaoService.ts`, `data/conviteAtivacaoRepository.ts` |
| ATD-08 pesquisa por nome/CPF/e-mail (modal "Consultar aluno") | `BuscaAlunoModal.tsx` |
| ATD-09/10/11 ficha do aluno **em modal** (`?aluno=id` na URL): dados, plano, pagamentos, Face ID, acesso ao app; editar (CPF imutável, troca de plano grava `HistoricoPlano`); cancelar matrícula (bloqueia check-in e login) | `AlunoDetalhe.tsx`, `data/historicoPlanoRepository.ts` |
| Recebimento no balcão **em modal** (`?pagamento=alunoId`; ao concluir volta para a ficha) e "Registrar pagamento" (escolhe a cobrança) | `RecebimentoBalcao.tsx`, `SelecionarCobrancaModal.tsx` |
| Check-in: câmera/resultado + "Entradas de hoje"; bloqueado por atraso oferece "Receber pagamento". Reconhecimento real (descritor de 128 números, distância ≤ 0,6); só compara alunos com rosto cadastrado. Câmera espelhada (selfie); a foto salva também, o descritor não | `AttendantCheckinPage.tsx`, `FaceIdPreview.tsx`, `utils/faceRecognition.ts` |
| Catálogo de planos (só consulta) com "Matricular neste plano" → abre o modal de cadastro (`/atendente?cadastro=novo&plano=id`) | `AttendantPlanosPage.tsx` |

Menu do atendente: Central, Check-in, Planos. A rota `/atendente/cadastro` foi removida.

### Aluno (módulos 5 e 6)

| Requisito | Situação / onde |
|---|---|
| ALU-01 criar senha pelo convite | ✅ `features/auth/AtivarContaPage.tsx` (rota pública `/ativar/:token`) |
| ALU-02/03/04/05 treino por dia da semana, catálogo por grupo, detalhe, adicionar a um dia | ✅ `SubscriberTreinoPage.tsx`. Vídeo-aula: como o catálogo não tem `videoUrl`, o link abre uma busca no YouTube. Treino é **editável por qualquer aluno** (decisão atual) |
| ALU-06/07/08 questionário de objetivos + recomendação | ✅ `SubscriberObjetivosPage.tsx`, `data/recomendacaoService.ts`, `data/metaService.ts`, entidade `ObjetivoAluno` |
| ALU-09 vitrine de personal + contratação | ✅ com **mock** — `SubscriberPersonalPage.tsx`, `data/vitrinePersonalService.ts`, `data/agendaProfissionalRepository.ts` |
| ALU-10 evolução física | ⏳ **desbloqueado** — `AvaliacaoFisica.tipo` já existe; falta criar a tela. Item escondido do menu; path `/aluno/evolucao` reservado |
| ALU-11/12/13 dashboard (próximo pagamento + pagar no app, treino de hoje, meta ativa) e `/aluno/financeiro` (extrato + PDF) | ✅ `SubscriberDashboardPage.tsx`, `SubscriberFinanceiroPage.tsx` |
| Extras pedidos pelo grupo: "Meu plano" (`/aluno/plano`) e "Perfil" (`/aluno/perfil`: dados só leitura + trocar senha) | ✅ `SubscriberPlanoPage.tsx`, `SubscriberPerfilPage.tsx` |

Menu do aluno: Dashboard, Treino, Objetivos, Personal, Financeiro, Meu plano, Perfil.

### Público

- `/matricula` virou **vitrine de planos** (não cria mais conta): planos + "como se matricular" em 3 passos.
- `/login`: e-mail/senha + atalhos "Entrar como…" (demo).

### Profissional (módulo 4 — PR #1 do colega, integrado e redesenhado no padrão do atendente)

| Tela | Onde |
|---|---|
| Central do profissional (`/profissional`): saudação, 3 indicadores, acesso rápido, "Atenção necessária" (sem avaliação / mensal pendente), agenda da semana | `ProfessionalDashboardPage.tsx` + `data/profissionalService.ts` |
| Meus alunos (`/profissional/alunos`): lista com filtro por situação da avaliação (juntou as antigas telas Alunos e Avaliações) | `ProfessionalAlunosPage.tsx` |
| Ficha do aluno **em modal** (`?aluno=id`): dados (só leitura), meta e treino, avaliações com histórico e variação vs. a anterior | `FichaAlunoProfissional.tsx` |
| Nova avaliação **em modal** (`?avaliacao=novo[&aluno=id]`): escolher aluno → dados (mensal mostra os valores anteriores) → concluído | `NovaAvaliacaoFluxo.tsx`, `useModaisDoProfissional.tsx` |
| Minha agenda (`/profissional/agenda`): grade semanal, "+" em cada dia abre modal | `ProfessionalAgendaPage.tsx` |

- Menu do profissional: Central, Meus alunos, Minha agenda.
- Avaliação física (RF-PRO-03/D19): `AvaliacaoFisica.tipo: 'principal' | 'mensal'`. `registrarAvaliacaoFisica()`
  sempre cria registro novo e decide o tipo (primeira = principal, demais = mensal).
- "Mensal pendente" = última avaliação há mais de `DIAS_PARA_NOVA_AVALIACAO` (30) dias — regra combinada nesta rodada.
- Agenda (RF-FUND-03/D13/D14): só `AgendaProfissional` (a entidade `Agendamento` do PR foi removida).
- Seed: Carla (`profissional@`, `prof-1`) tem Gabriel (sem avaliação), Juliana (mensal pendente) e Patricia (em dia)
  como alunos personal, e agenda seg–qui. As datas das avaliações do seed são relativas a hoje.

### Padrão visual compartilhado (atendente = profissional)

- `components/painel`: `CabecalhoCentral`, `CabecalhoPagina`, `FaixaIndicadores`/`Indicador`, `AcessoRapido`/
  `AcaoRapida`, `ItemAluno`, `EstadoVazio`, `Abas`, `Linha`, `formatarDataBr`. Tela nova de qualquer papel usa estes.
- `components/aluno`: `AvatarAluno` (sm/md/lg), `SeloSituacaoAluno`, `CabecalhoFicha`.
- `components/common`: além de Button/Input/Card/Modal, `Alerta` (erro/sucesso/aviso/info — nunca texto colorido
  solto), `CampoBusca`, `Confirmacao` (no lugar de `window.confirm`).
- `utils/formatacao.ts`: `formatarMoeda` ("R$ 99,90"), `formatarNumero` ("71,5"), `formatarDataBr`. Não usar
  `toFixed(2)` para exibir dinheiro.
- Cantos: caixas grandes (`Card`, `Modal`, blocos) `rounded-2xl`; itens, campos e botões `rounded-xl`.
- `Modal` fecha com Esc (só o de cima, quando há modal dentro de modal) e com clique no fundo. Um modal que precisa
  ficar por cima de outro deve ser renderizado depois dele no JSX.
- Textos de tela sempre acentuados (inclusive no seed).

### Outros módulos (de outras pessoas — ainda placeholder)

Fundação (motor de cobrança RF-FUND-02), Admin (dashboard, `/admin/*`), Apresentação (módulo 7).

## Decisões tomadas (não reabrir sem o grupo)

- **Senha:** o atendente nunca define a senha. Conta "pendente de senha" = `Usuario.password === ''` (o tipo `Usuario`
  não mudou). Login de conta pendente retorna `'pendente'`; de aluno cancelado, `'bloqueado'` (`store/authStore.ts`).
  `ProtectedRoute` também derruba sessão de aluno cancelado.
- **Recomendação (ALU-08):** união dos exercícios dos grupos escolhidos, sem repetir, limitada pelo nível de experiência
  (iniciante → iniciante; intermediário → até intermediário; avançado → todos). O objetivo não filtra exercício.
- **Meta:** `Meta.profissionalId` agora é **opcional**. Sem personal, o status é calculado a cada leitura
  (`calcularProgressoMeta`): frequência = check-ins liberados; peso = avaliação física mais recente (direção pelo peso
  de partida); medida = sem regra automática. Refazer o questionário reaproveita a meta criada pelo aluno.
- **Personal (D11/D12):** contratar **atualiza** o `Atendimento` existente do aluno para `type: 'personal'` (ou cria um,
  se não houver) e **não cria Pagamento**. Treino "solto" (sem vínculo) passa para o novo atendimento.
- **Aluno sem Atendimento** (recém-matriculado) tem treino com `atendimentoId: ''` — não quebra a tela.
- **Movimentação recente:** só check-in tem horário; pagamento/matrícula/plano mostram só a data (os tipos não guardam
  hora — mudar isso exige avisar o grupo).
- Indicadores e "Atenção necessária" ignoram alunos cancelados. "Pendências" = pagamento `late` + aluno ativo sem Face ID.

## Pontos de acoplamento para outros módulos

- **Agenda (Fundação/Profissional):** tipo `AgendaProfissional { id, profissionalId, diaSemana, horaInicio, horaFim }`
  e `agendaProfissionalRepository`. A tela `/profissional/agenda` grava com `salvarItemAgenda` / `removerItemAgenda`;
  a vitrine lê dali. Não existe mais `Agendamento`.
- **Preço do personal:** `Profissional` não tem campo de preço → tabela `VALOR_MENSAL_PERSONAL_MOCK` em
  `vitrinePersonalService.ts`. Quando definirem onde mora o preço, só `valorMensalDoPersonal()` muda.
- **Inadimplência (D4):** check-in hoje bloqueia qualquer pagamento `late` (`avaliarAcesso` em
  `checkinRepository.ts`). Quando a Fundação entregar `alunoEstaInadimplente()`, trocar ali.
- **Evolução (ALU-10):** `AvaliacaoFisica.tipo` já existe (D19) — falta criar `/aluno/evolucao` e devolver o
  item ao menu do aluno.
- **Pagamento do personal:** o valor do personal entra no próximo pagamento gerado pelo motor de cobrança (D7) —
  depende do RF-FUND-02.

## Entidades/arquivos novos desta rodada (avisar o grupo — regra 3)

- Tipos novos: `ConviteAtivacao`, `ObjetivoAluno`, `AgendaProfissional`.
- Tipos alterados: `Treino`/`ExercicioTreino` (`exercicioId` + `diaSemana`, `recorrente`), `Meta.profissionalId?`.
- Repositories/serviços novos: `historicoPlanoRepository`, `conviteAtivacaoRepository`, `objetivoAlunoRepository`,
  `agendaProfissionalRepository`, `matriculaService`, `ativacaoService`, `recepcaoService`, `recomendacaoService`,
  `metaService`, `vitrinePersonalService`.
- Componentes compartilhados: `components/plano/CartaoPlano.tsx`; `Modal` ganhou `size="xl"`; `PagamentoCheckout`
  ganhou `descricao` e `metodosPermitidos`.

## Pendências conhecidas

- **Nada foi testado no navegador ainda** — só typecheck, build e testes de lógica em Node. Percorrer o roteiro da demo.
- **Nada commitado** (tudo na `main`, sem commit). Sugestão: branch `feature/atendente-aluno-requisitos`.
- Marcar os checkboxes em `plano-de-desenvolvimento/02`, `05`, `06` depois de testar.
- Próximo foco combinado: **melhorar o atendente** (depois do aluno). Ideias levantadas:
  - Caso raro: sair da tela com o comprovante aberto (antes de "continuar") deixa pagamento sem aluno.
- Links do Admin/Profissional no menu levam a placeholders ou ao login.

## Roteiro da demo

1. **Atendente** (`atendente@biggym.com` / `atendente123` ou atalho): Central da Recepção → "Novo aluno" (usar
   "Gerar CPF de teste") → plano → e-mail conferido → pagamento → rosto (ou pular) → **QR code do convite**.
2. No celular (abrir o sistema pelo IP da rede, não `localhost`), ler o QR e criar a senha → cai no app do aluno.
3. Atendente: "Atenção necessária" → Carlos (atrasado) → "Receber" → check-in liberado; ficha → editar/cancelar.
4. **Aluno** (`aluno@biggym.com` / `aluno123`, tem personal): dashboard → pagar mensalidade → financeiro (PDF) →
   treino → objetivos (questionário + recomendados). Vitrine de personal: entrar como `marina@email.com` / `aluno123`.
5. Fechar explicando o que é simulado: catraca (o Face ID reconhece o rosto de verdade, no navegador, com
   @vladmandic/face-api, mas não há catraca física), pagamento (sem gateway), envio do
   convite (sem e-mail real), senha em texto puro no `localStorage`, agenda/preço do personal (mock).

Usuários do seed: todos os alunos têm senha `aluno123` (`marina@`, `carlos@`, `fernanda@` (cancelada), `gabriel@`,
`juliana@`, `patricia@` — domínio `email.com`); admin `admin@biggym.com`/`admin123`; profissional
`profissional@biggym.com`/`prof123`.
