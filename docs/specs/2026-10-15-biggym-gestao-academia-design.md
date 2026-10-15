# BigGym — Spec Técnico (Fase 1: Sistema de Gestão de Academia)

## 1. Contexto e Objetivo

Projeto acadêmico tratado com padrão de portfólio. Requisitos formais do professor: **Projeto React, Componentes criados, Projeto navegável**, apenas **front-end** (sem backend/banco real).

Narrativa de produto: BigGym é pensado como um futuro SaaS multi-tenant para academias pequenas/médias (ex: venderia para academias de bairro). Essa camada de SaaS (landing page, onboarding de novas academias, multi-tenant) é **Fase 2**, construída por cima do que sair da Fase 1.

**Fase 1 (este spec):** sistema de gestão completo e coeso para **uma academia**, com três experiências de uso (Admin, Profissional, Aluno), dados mockados persistidos em `localStorage`.

## 2. Stack

- React + Vite
- Tailwind CSS (sem lib de componentes prontos — componentes construídos do zero, atendendo ao requisito "componentes criados")
- React Router v6 (navegação multi-página, satisfaz "projeto navegável")
- Zustand (estado global: sessão do usuário, dados em uso)
- `localStorage` com seed inicial (simula banco de dados; dados cadastrados pelo usuário persistem entre sessões)
- Recharts (gráficos de evolução física e financeiro)
- jsPDF (geração de recibo de pagamento em PDF)

Justificativa: stack 100% padrão de mercado, nada exótico; cada peça mapeia diretamente a um requisito do professor (ver seção 1).

## 3. Papéis e Autenticação

Três papéis de acesso (três conjuntos de telas/rotas):

1. **Admin** — gestor da academia
2. **Profissional** — cobre Instrutor e Personal. É o **mesmo papel de acesso** (mesmas telas/componentes); a distinção entre instrutor e personal não é no cadastro da pessoa, é no **vínculo** com cada aluno (ver seção 4, entidade `Atendimento`). Na prática do negócio modelada: instrutores e personais são ambos funcionários da própria academia — não existe personal freelancer no sistema.
3. **Aluno/Assinante** — o próprio aluno, consumidor do serviço

Login mockado: tela única com atalhos de demonstração ("Entrar como Admin/Profissional/Aluno") e campos de usuário/senha funcionais. Zustand guarda o usuário autenticado (incluindo papel); React Router protege rotas por papel — acesso a uma rota fora do papel do usuário redireciona de volta ao próprio dashboard.

Logout retorna à tela de login.

## 4. Modelo de Dados (entidades mockadas)

Adaptado do modelo original do usuário, com os ajustes de domínio decididos nesta sessão:

```
Usuario (auth)
  id, email, senha, papel: 'admin' | 'profissional' | 'aluno', refId

Academia
  id, nome, endereco, telefone

Profissional
  id, nome, cpf, telefone, nascimento, tipo_base: 'instrutor' | 'personal' (classificação padrão
    da pessoa, mas o que importa pro negócio é o vínculo — ver Atendimento),
  especializacao, observacoes

Aluno
  id, nome_completo, peso, altura, telefone, cpf, endereco, nascimento, observacoes,
  id_plano_atual, data_inicio

Plano
  id, nome, valor, modalidades, condicoes

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
```

### Regras de negócio relevantes

- **Plano:** aluno tem um plano atual (referência direta); trocas de plano ficam registradas em `HistoricoPlano`, sem precisar editar o histórico financeiro retroativamente.
- **Atendimento (instrutor x personal):** todo aluno tem pelo menos um vínculo `padrao` (instrutor, incluso no plano). Pode adicionalmente ter um vínculo `personal` (serviço com `valor` cobrado a mais). O mesmo profissional pode ser instrutor de um aluno e personal de outro — a distinção vive no vínculo, não na pessoa.
- **Metas:** restritas a alunos com vínculo `personal` ativo — só o Personal cria/gerencia metas, reflexo da autonomia desse serviço dedicado (instrutor orienta, não define metas individuais).
- **Pagamento:** gerado automaticamente a partir do plano vigente do aluno (não lançado manualmente pelo Admin), simulando a regra de cobrança recorrente. Fluxo: `pendente → pago` (ou `atrasado` se passar da `data_vencimento`, com cálculo de `multa_juros`). Pagamento aprovado gera um **recibo em PDF** (jsPDF) com numeração sequencial. Nenhuma integração real de pagamento — a simulação para na fronteira do "processamento" (delay artificial + sempre aprova, ou recusa aleatória para exercitar tratamento de erro).
- **Financeiro:** não é digitado — é sempre calculado a partir dos registros de `Pagamento` do mês (soma de receitas, soma de atrasados = inadimplência).
- **Treino:** só existe um treino `ativo = true` por aluno por vez; criar um novo treino desativa o anterior (preserva histórico).

## 5. Mapa de Páginas (rotas)

**Público:**
- `/login`

**Admin** (`/admin/...`):
- `/admin` — dashboard (receita do mês, inadimplência, alunos ativos, aniversariantes)
- `/admin/alunos`, `/admin/alunos/:id`
- `/admin/planos`
- `/admin/profissionais`
- `/admin/financeiro`

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

## 6. Fora de Escopo da Fase 1 (backlog de evolução futura)

Registrado para construção incremental, sem comprometer o cronograma da Fase 1:

1. **Landing page + multi-tenant real (Fase 2 — "casca" SaaS):** página de vendas do produto, cadastro de novas academias, isolamento de dados por `id_academia`, personalização visual (white-label) por academia.
2. **Motor de recomendação de treino baseado em regras** — cruza objetivo, meta ativa, tempo de treino, histórico de treinos e restrições de saúde do aluno para sugerir um template de treino, com explicação textual do porquê da sugestão. Decisão final de adotar ou não é do aluno. Explicitamente um **motor de regras**, não um modelo de IA treinado — importante deixar claro na apresentação por responsabilidade técnica.
3. **Autonomia expandida do aluno:** aluno passa a poder montar/ajustar o próprio treino e metas (hoje restrito ao Personal), com apoio do motor de recomendação do item 2.
4. **Check-in de frequência** (presença simulada, métricas de risco de desistência).
5. **Agenda de aulas coletivas** com reserva de vaga.
6. **Evolução física com fotos** (antes/depois) acopladas ao gráfico.
7. **PWA instalável** para a visão do Aluno (uso mobile real, "olhar o treino/pagamento pelo celular").

## 7. Responsabilidade de Apresentação

O autor deste spec é responsável por toda a implementação técnica e pela defesa das decisões junto ao professor; outros colaboradores do grupo cuidam de partes não-técnicas. O spec existe para que cada decisão (especialmente as simulações — pagamento, financeiro, motor de regras) tenha uma explicação clara e defensável: **o que é real/lógica de negócio de verdade vs. o que é simulado e por quê**.
