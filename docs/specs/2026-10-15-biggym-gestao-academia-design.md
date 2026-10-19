# BigGym — Spec Técnico (Fase 1: Sistema de Gestão de Academia)

> Revisado em 2026-10-19: adiciona o papel Atendente, check-in/catraca, dia de teste,
> planos via parceiro (TotalPass/Wellhub) e a ordem de construção do projeto.

## 1. Contexto e Objetivo

Projeto acadêmico tratado com padrão de portfólio. Requisitos formais do professor: **Projeto React, Componentes criados, Projeto navegável**, apenas **front-end** (sem backend/banco real).

Narrativa de produto: BigGym é pensado como um futuro SaaS multi-tenant para academias pequenas/médias (ex: venderia para academias de bairro). Essa camada de SaaS (landing page, onboarding de novas academias, multi-tenant) é **Fase 2**, construída por cima do que sair da Fase 1.

**Fase 1 (este spec):** sistema de gestão completo e coeso para **uma academia**, com quatro experiências de uso (Admin, Atendente, Profissional, Aluno), dados mockados persistidos em `localStorage`.

## 2. Stack

- React + Vite
- Tailwind CSS (sem lib de componentes prontos — componentes construídos do zero, atendendo ao requisito "componentes criados")
- React Router v6 (navegação multi-página, satisfaz "projeto navegável")
- Zustand (estado global: sessão do usuário, dados em uso)
- `localStorage` com seed inicial (simula banco de dados; dados cadastrados pelo usuário persistem entre sessões)
- Recharts (gráficos de evolução física e financeiro)
- jsPDF (geração de recibo de pagamento em PDF)

Justificativa: stack 100% padrão de mercado, nada exótico; cada peça mapeia diretamente a um requisito do professor (ver seção 1). Toda funcionalidade que pareceria exigir backend real (pagamento, Face ID, integração com parceiro) é **simulada no front-end**, nunca substituída por algo mais simples que mude a regra de negócio — ver seção 7.

## 3. Papéis e Autenticação

Quatro papéis de acesso (quatro conjuntos de telas/rotas):

1. **Admin** — o dono da academia. Acesso total: financeiro, relatórios, gestão de planos e profissionais.
2. **Atendente** — equipe de balcão/recepção. Cadastra aluno novo, libera dia de teste, faz check-in (catraca/Face ID simulado), registra pagamento recebido no balcão, busca alunos. **Não** acessa financeiro, relatórios, nem gestão de planos/profissionais — só opera o dia a dia da recepção.
3. **Profissional** — cobre Instrutor e Personal. É o **mesmo papel de acesso** (mesmas telas/componentes); a distinção entre instrutor e personal não é no cadastro da pessoa, é no **vínculo** com cada aluno (ver seção 4, entidade `Atendimento`). Na prática do negócio modelada: instrutores e personais são ambos funcionários da própria academia — não existe personal freelancer no sistema.
4. **Aluno/Assinante** — o próprio aluno, consumidor do serviço. Pode se matricular sozinho pelo site (`/matricula`, autoatendimento) ou ser cadastrado por um Atendente presencialmente — os dois fluxos geram o mesmo registro de `Aluno`.

Login mockado: tela única com atalhos de demonstração ("Entrar como Admin/Atendente/Profissional/Aluno") e campos de usuário/senha funcionais. Zustand guarda o usuário autenticado (incluindo papel); React Router protege rotas por papel — acesso a uma rota fora do papel do usuário redireciona de volta ao próprio dashboard. Literal usado no código para o papel novo: `'atendente'` (os demais papéis já existem em inglês no código — `admin`, `professional`, `subscriber` — mantidos como estão para não quebrar o que já funciona).

Logout retorna à tela de login.

## 4. Modelo de Dados (entidades mockadas)

```
Usuario (auth)
  id, email, senha, papel: 'admin' | 'atendente' | 'professional' | 'subscriber', refId

Academia
  id, nome, endereco, telefone

Profissional
  id, nome, cpf, telefone, nascimento, tipo_base: 'instrutor' | 'personal' (classificação padrão
    da pessoa, mas o que importa pro negócio é o vínculo — ver Atendimento),
  especializacao, observacoes

Aluno
  id, nome_completo, peso, altura, telefone, cpf, endereco, nascimento, observacoes,
  id_plano_atual, data_inicio, status: 'ativo' | 'cancelado'

Plano
  id, nome, valor, modalidades, condicoes, origem: 'direto' | 'parceiro',
  nome_parceiro?: 'totalpass' | 'wellhub' (preenchido só quando origem = 'parceiro')

HistoricoPlano
  id, id_aluno, id_plano, data_inicio, data_fim (registra trocas de plano ao longo do tempo)

Atendimento (vínculo aluno–profissional; resolve a distinção instrutor/personal)
  id, id_aluno, id_profissional, tipo: 'padrao' | 'personal', valor? (preenchido só quando tipo = 'personal')

Treino
  id, id_aluno, id_atendimento (quem montou), semana, exercicios: [{nome, series, repeticoes}],
  data_inicio, ativo: boolean, origem: 'manual' | 'sugerido'

Meta
  id, id_aluno, id_profissional (sempre um Personal — ver regra de negócio abaixo), descricao,
  tipo: 'peso' | 'medida' | 'frequencia', valor_alvo, prazo, status: 'em_andamento' | 'concluida' | 'atrasada'

AvaliacaoFisica
  id, id_aluno, objetivo, descricao, observacoes, data_avaliacao, peso, medidas{}

Pagamento
  id, id_academia, id_aluno, id_plano, valor_original, valor_pago, multa_juros,
  metodo_pagamento, data_vencimento, data_pagamento, status: 'pendente' | 'pago' | 'atrasado',
  numero_recibo

Financeiro (agregado mensal, derivado dos Pagamentos — calculado, não digitado manualmente)
  id, id_academia, mes_referencia, receitas, despesas, inadimplencia

CheckIn (novo — registro de entrada na catraca)
  id, id_aluno, timestamp, metodo: 'faceid' | 'manual', acesso_liberado: boolean

Visitante (novo — dia de teste, ainda não é Aluno)
  id, nome, telefone, data_visita
```

### Regras de negócio relevantes

- **Plano:** aluno tem um plano atual (referência direta); trocas de plano ficam registradas em `HistoricoPlano`, sem precisar editar o histórico financeiro retroativamente.
- **Plano via parceiro (TotalPass/Wellhub):** quando `Plano.origem === 'parceiro'`, o `Pagamento` desse aluno nasce automaticamente com `status: 'pago'` e `metodo_pagamento: 'parceiro'` — simula que o parceiro repassa o valor pra academia por fora, sem cobrança direta do aluno. Nenhuma chamada de API externa real; é só uma regra de geração de pagamento diferente da padrão.
- **Atendimento (instrutor x personal):** todo aluno tem pelo menos um vínculo `padrao` (instrutor, incluso no plano). Pode adicionalmente ter um vínculo `personal` (serviço com `valor` cobrado a mais). O mesmo profissional pode ser instrutor de um aluno e personal de outro — a distinção vive no vínculo, não na pessoa.
- **Metas:** restritas a alunos com vínculo `personal` ativo — só o Personal cria/gerencia metas, reflexo da autonomia desse serviço dedicado (instrutor orienta, não define metas individuais).
- **Pagamento:** gerado automaticamente a partir do plano vigente do aluno (não lançado manualmente pelo Admin, exceto pagamento recebido no balcão pelo Atendente — ver seção 5), simulando a regra de cobrança recorrente. Fluxo: `pendente → pago` (ou `atrasado` se passar da `data_vencimento`, com cálculo de `multa_juros`). Pagamento aprovado gera um **recibo em PDF** (jsPDF) com numeração sequencial. Nenhuma integração real de pagamento — a simulação para na fronteira do "processamento" (delay artificial + sempre aprova, ou recusa aleatória para exercitar tratamento de erro).
- **Financeiro:** não é digitado — é sempre calculado a partir dos registros de `Pagamento` do mês (soma de receitas, soma de atrasados = inadimplência).
- **Treino:** só existe um treino `ativo = true` por aluno por vez; criar um novo treino desativa o anterior (preserva histórico).
- **Acesso à catraca (não é campo salvo, é calculado):** um aluno tem acesso liberado se **não** possui nenhum `Pagamento` com `status === 'atrasado'`. Todo `CheckIn` consulta essa regra no momento do registro e grava o resultado (`acesso_liberado`) como histórico — o histórico é fixo (fotografia daquele instante), mas a regra em si nunca é armazenada separadamente, só recalculada.
- **Status do aluno (`ativo`/`cancelado`):** é uma decisão de ciclo de vida da matrícula (o aluno saiu ou foi desligado), **independente** do bloqueio de catraca por inadimplência — um aluno pode estar `ativo` e mesmo assim ter acesso bloqueado por atraso de pagamento. São duas regras distintas, não uma substituindo a outra.
- **Dia de teste:** um `Visitante` não é um `Aluno` — não tem plano, não gera pagamento, não aparece nas métricas de alunos ativos. Se decidir se matricular depois, o Atendente usa o fluxo normal de cadastro (o registro de `Visitante` fica só como histórico de quem já visitou).
- **Face ID no check-in:** simulado — a tela usa a câmera do navegador (`getUserMedia`) só para mostrar um preview visual de "reconhecendo"; a identificação real é lógica de busca (acha o aluno pelo CPF/nome informado antes de abrir a câmera) e a aprovação segue a regra de acesso à catraca acima. Não há nenhum modelo de reconhecimento facial de verdade — importante deixar isso explícito na apresentação (ver seção 7).

## 5. Mapa de Páginas (rotas)

**Público:**
- `/login`
- `/matricula` — autoatendimento (visitante se cadastra sozinho)

**Admin** (`/admin/...`):
- `/admin` — dashboard (receita do mês, inadimplência, alunos ativos, aniversariantes)
- `/admin/alunos`, `/admin/alunos/:id`
- `/admin/planos` (inclui criar plano via parceiro — TotalPass/Wellhub)
- `/admin/profissionais`
- `/admin/financeiro`

**Atendente** (`/atendente/...`):
- `/atendente` — dashboard (busca de aluno, ações rápidas: cadastrar, dia de teste, check-in, pagamento no balcão)
- `/atendente/cadastro` — cadastro presencial de aluno novo (mesma lógica de `/matricula`, formulário preenchido pelo atendente)
- `/atendente/dia-de-teste` — registrar `Visitante`
- `/atendente/checkin` — buscar aluno + check-in (Face ID simulado ou manual)
- `/atendente/pagamento/:alunoId` — registrar pagamento recebido no balcão

**Profissional** (`/profissional/...`):
- `/profissional` — dashboard (alunos vinculados, filtrando por tipo de atendimento)
- `/profissional/alunos/:id`
- `/profissional/treinos/:id` — criar/editar treino
- `/profissional/avaliacoes/:alunoId`
- `/profissional/metas/:alunoId` — somente visível/editável quando o vínculo é `personal`

**Aluno** (`/aluno/...`):
- `/aluno` — dashboard (próximo pagamento, treino do dia, meta ativa)
- `/aluno/treino`
- `/aluno/evolucao` — gráfico de peso/medidas (Recharts)
- `/aluno/financeiro` — histórico, recibos
- `/aluno/perfil`

## 6. Ordem de Construção e Divisão de Trabalho

Contexto: o esqueleto do projeto (tipos, repositories, `authStore`, componentes de UI comuns, layout com sidebar, login, rotas protegidas por papel) já está pronto. Os três dashboards originais (Admin/Profissional/Aluno) ainda são placeholders. O grupo tem 4+ pessoas programando, a maioria iniciante em React — a divisão abaixo foi pensada para isso.

**Fase A — peça de referência (feita por quem já domina o padrão do projeto):**
1. Modelo de dados novo: `Aluno.status`, entidade `CheckIn`, entidade `Visitante`, campos novos em `Plano`/`Pagamento`, mais o papel `'atendente'` em `PapelUsuario` e nas rotas protegidas.
2. Fluxo completo do Atendente (`/atendente/*`): busca de aluno, cadastro, dia de teste, check-in (Face ID simulado), pagamento no balcão.

Essa fase é intencionalmente a mais trabalhosa — ela fixa o padrão (formulário → repository → regra de negócio calculada → feedback na tela) que todas as tarefas da Fase B vão copiar. Depois de pronta, vale documentar esse padrão (ver seção 8) antes de distribuir o resto.

**Fase B — dividida entre o restante do grupo, em paralelo, respeitando dependência:**
- Admin dashboard + páginas de gestão (`/admin/planos` com suporte a parceiro, `/admin/profissionais`, `/admin/financeiro`) — pode começar logo depois da Fase A, usa o mesmo padrão de leitura/exibição.
- Profissional dashboard + treinos/metas/avaliações — depende apenas do `Atendimento`, que já existe no repository hoje.
- Aluno dashboard + evolução + financeiro (recibo em PDF) — depende de `Pagamento`/`CheckIn` existirem (Fase A).
- `Admin/alunos` (lista + detalhe) — pode ser feito em paralelo com qualquer um dos itens acima, baixo risco de conflito.

## 7. Guia de Padrão para Colaboradores Iniciantes

A maioria do grupo vai escrever código apoiado em IA generativa (ex: ChatGPT), sem o contexto completo do repositório. Pra reduzir o risco de cada tela sair com um padrão diferente, toda tarefa distribuída (no plano de implementação que vem depois deste spec) deve vir com:

- Caminho exato do(s) arquivo(s) a criar/editar.
- Quais `types`, `*Repository.ts` e componentes de `src/components/common` usar (nomes exatos, sem inventar novo).
- Um trecho de código de exemplo retirado da Fase A (ou de uma tela já pronta), pra copiar o padrão em vez de recriar um novo.
- O que **não** tocar (ex: "não edite `storage.ts`", "não crie um novo componente de botão").

Regra de ouro pra quem for colar a tarefa num ChatGPT: colar junto o trecho de exemplo do padrão, não só a descrição da tarefa — isso ancora a resposta da IA no estilo do projeto em vez de um estilo genérico.

## 8. Fora de Escopo da Fase 1 (backlog de evolução futura)

Registrado para construção incremental, sem comprometer o cronograma da Fase 1:

1. **Landing page + multi-tenant real (Fase 2 — "casca" SaaS):** página de vendas do produto, cadastro de novas academias, isolamento de dados por `id_academia`, personalização visual (white-label) por academia.
2. **Motor de recomendação de treino baseado em regras** — cruza objetivo, meta ativa, tempo de treino, histórico de treinos e restrições de saúde do aluno para sugerir um template de treino, com explicação textual do porquê da sugestão. Decisão final de adotar ou não é do aluno. Explicitamente um **motor de regras**, não um modelo de IA treinado — importante deixar claro na apresentação por responsabilidade técnica.
3. **Autonomia expandida do aluno:** aluno passa a poder montar/ajustar o próprio treino e metas (hoje restrito ao Personal), com apoio do motor de recomendação do item 2.
4. **Agenda de aulas coletivas** com reserva de vaga.
5. **Evolução física com fotos** (antes/depois) acopladas ao gráfico.
6. **PWA instalável** para a visão do Aluno (uso mobile real, "olhar o treino/pagamento pelo celular").
7. **Face ID real / integração real TotalPass-Wellhub:** a versão simulada (seção 4) resolve a Fase 1; uma integração de verdade exigiria backend e contratos com os parceiros, fora do escopo de um projeto front-end acadêmico.

## 9. Responsabilidade de Apresentação

O autor deste spec é responsável por toda a implementação técnica e pela defesa das decisões junto ao professor; outros colaboradores do grupo cuidam de partes não-técnicas ou de tarefas de código isoladas e bem definidas (Fase B, seção 6). O spec existe para que cada decisão (especialmente as simulações — pagamento, Face ID, parceiro, financeiro) tenha uma explicação clara e defensável: **o que é real/lógica de negócio de verdade vs. o que é simulado e por quê**.
