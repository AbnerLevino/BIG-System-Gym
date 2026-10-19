# Fluxo do Atendente (Fase A) — Plano de Implementação

> **Para quem for executar:** este plano não é pra um agente autônomo — é pra um time
> misto (você + colegas iniciantes, alguns apoiados em ChatGPT). Cada Task abaixo é uma
> unidade de trabalho isolada: um branch, um Pull Request (siga o `CONTRIBUTING.md` já
> existente no repo). A "Task N" diz quem deveria fazer ela e por quê.
>
> Leia `docs/specs/2026-10-15-biggym-gestao-academia-design.md` antes de começar — ele
> tem o contexto completo (por que o Atendente existe, as regras de negócio, o que é
> simulado e por quê). Este plano só traduz esse spec em passos concretos de código.

**Objetivo:** construir o papel "Atendente" (4º papel de acesso) de ponta a ponta:
cadastro presencial, dia de teste, check-in com Face ID simulado, pagamento no balcão
— além do modelo de dados novo que tudo isso depende (status do aluno, plano via
parceiro, check-in, visitante).

**Arquitetura:** segue 100% o padrão que já existe no projeto — `types` (contrato) →
`data/*Repository.ts` (leitura/escrita no `localStorage`) → `features/<nome>/*Page.tsx`
(tela, usa `AppLayout` + componentes de `components/common`). Nenhuma lógica nova de
infraestrutura; só mais entidades e mais telas seguindo o que já existe.

**Tech Stack:** React + Vite + TypeScript + Tailwind + React Router + Zustand +
`localStorage`. Task 7 adiciona `jspdf` (única dependência nova do projeto).

## Convenções do projeto (valem pra toda Task abaixo)

- Nomes de campo e valores de enum em **inglês** (ex: `fullName`, `status: 'active'`),
  igual todo o resto do código hoje — só textos de tela, comentários, nomes de branch e
  commit ficam em português. Única exceção já decidida: o literal do papel novo é
  `'atendente'` (em português), por escolha explícita do time.
- **Regra do `CONTRIBUTING.md`:** uma feature nunca importa de outra feature. A tela de
  cadastro do Atendente (Task 5) não importa nada de `features/home/MatriculaPage.tsx`
  mesmo sendo parecida — o código é duplicado ali, de propósito.
- Não existe suíte de testes automatizados neste projeto (confirmado em `package.json` —
  só `dev`, `build`, `preview`, `typecheck`). Por isso, em vez de "escreva o teste,
  veja falhar, implemente", o ciclo aqui é: **mude o tipo → rode `npm run typecheck` e
  veja o erro exato → implemente → rode `npm run typecheck` de novo até limpar → confira
  visualmente no navegador → commit.** Isso cumpre o mesmo papel do red/green do TDD,
  usando a ferramenta que o projeto já tem.
- Pra ver a tela rodando: `npm run dev` (abre em `http://localhost:5173`, ou outra porta
  se a 5173 já estiver em uso — o terminal mostra qual).

---

### Task 1 (você): Tipos — papel atendente, status do aluno, plano via parceiro

**Quem faz:** você. Esta task muda contratos (`types`) que todo o resto do plano depende —
precisa estar pronta e no `main` antes de qualquer colega começar.

**Files:**
- Modify: `src/types/usuario.ts`
- Modify: `src/types/aluno.ts`
- Modify: `src/types/plano.ts`
- Modify: `src/data/seed.ts`

**Interfaces:**
- Produces: `PapelUsuario` passa a incluir `'atendente'`. `Aluno.status: StatusAluno`
  (`'active' | 'cancelled'`). `Plano.origin: OrigemPlano` (`'direct' | 'partner'`),
  `Plano.partnerName?: NomeParceiro` (`'totalpass' | 'wellhub'`).

- [ ] **Step 1: Adicionar o papel `atendente`**

Em `src/types/usuario.ts`, troque a linha do tipo:

```ts
export type PapelUsuario = 'admin' | 'atendente' | 'professional' | 'subscriber'
```

- [ ] **Step 2: Adicionar `status` ao Aluno**

Em `src/types/aluno.ts`, adicione o tipo e o campo (arquivo completo esperado):

```ts
// O aluno/assinante. planoAtualId é a referência direta ao plano atual;
// trocas de plano ficam registradas separado em HistoricoPlano, sem editar isso aqui.
export type StatusAluno = 'active' | 'cancelled'

export interface Aluno {
  id: string
  fullName: string
  weight: number
  height: number
  phone: string
  cpf: string
  address: string
  birthDate: string
  notes: string
  planoAtualId: string
  startDate: string
  status: StatusAluno
}
```

- [ ] **Step 3: Adicionar `origin`/`partnerName` ao Plano**

Em `src/types/plano.ts`, adicione os tipos e os campos (arquivo completo esperado):

```ts
// Plano é a oferta (nome, preço, condições). HistoricoPlano abaixo registra cada
// período em que um Aluno esteve nesse plano — histórico de trocas.
export type OrigemPlano = 'direct' | 'partner'
export type NomeParceiro = 'totalpass' | 'wellhub'

export interface Plano {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
  origin: OrigemPlano
  partnerName?: NomeParceiro
}

export interface HistoricoPlano {
  id: string
  alunoId: string
  planoId: string
  startDate: string
  endDate: string | null
}
```

- [ ] **Step 4: Rodar o typecheck e ver os erros esperados**

Run: `npm run typecheck`
Expected: FAIL — erros em `src/data/seed.ts` dizendo que os objetos de `seedAlunos` e
`seedPlanos` não têm as propriedades `status` e `origin` (propriedade obrigatória
faltando). Isso é esperado — é o seed que ainda não foi atualizado.

- [ ] **Step 5: Atualizar o seed pra bater com os tipos novos**

Em `src/data/seed.ts`, adicione `status: 'active'` em cada item de `seedAlunos` e
`origin: 'direct'` em cada item de `seedPlanos`. Resultado esperado nesses dois trechos:

```ts
export const seedPlanos: Plano[] = [
  { id: 'plan-1', name: 'Mensal Basico', price: 99.9, modalities: ['Musculacao'], conditions: 'Sem fidelidade', origin: 'direct' },
  { id: 'plan-2', name: 'Trimestral Plus', price: 259.9, modalities: ['Musculacao', 'Funcional'], conditions: '3 meses, 10% de desconto', origin: 'direct' },
]
```

```ts
export const seedAlunos: Aluno[] = [
  {
    id: 'sub-1',
    fullName: 'Joao Pereira',
    weight: 82,
    height: 178,
    phone: '(11) 98888-0001',
    cpf: '333.333.333-33',
    address: 'Rua A, 10',
    birthDate: '1995-02-20',
    notes: '',
    planoAtualId: 'plan-1',
    startDate: '2026-01-10',
    status: 'active',
  },
  {
    id: 'sub-2',
    fullName: 'Marina Souza',
    weight: 65,
    height: 165,
    phone: '(11) 98888-0002',
    cpf: '444.444.444-44',
    address: 'Rua B, 20',
    birthDate: '1998-07-15',
    notes: '',
    planoAtualId: 'plan-2',
    startDate: '2026-02-01',
    status: 'active',
  },
]
```

Também adicione o usuário demo do novo papel em `seedUsuarios` (mesmo arquivo):

```ts
export const seedUsuarios: Usuario[] = [
  { id: 'user-admin', email: 'admin@biggym.com', password: 'admin123', role: 'admin', refId: 'gym-1' },
  { id: 'user-atendente', email: 'atendente@biggym.com', password: 'atendente123', role: 'atendente', refId: 'gym-1' },
  { id: 'user-prof', email: 'profissional@biggym.com', password: 'prof123', role: 'professional', refId: 'prof-1' },
  { id: 'user-sub', email: 'aluno@biggym.com', password: 'aluno123', role: 'subscriber', refId: 'sub-1' },
]
```

- [ ] **Step 6: Rodar o typecheck de novo**

Run: `npm run typecheck`
Expected: PASS (sem erros).

- [ ] **Step 7: Commit**

```bash
git add src/types/usuario.ts src/types/aluno.ts src/types/plano.ts src/data/seed.ts
git commit -m "feat: adicionar papel atendente, status do aluno e plano via parceiro"
```

---

### Task 2 (você): Entidades CheckIn/Visitante + repositories + regra de acesso à catraca

**Quem faz:** você. Depende da Task 1 estar no `main` (usa `obterPagamentosPorAluno`,
que já existe, e os tipos novos do `data/seed.ts`).

**Files:**
- Create: `src/types/checkin.ts`
- Create: `src/types/visitante.ts`
- Modify: `src/types/index.ts`
- Modify: `src/data/seed.ts`
- Create: `src/data/checkinRepository.ts`
- Create: `src/data/visitanteRepository.ts`
- Modify: `src/data/index.ts`

**Interfaces:**
- Consumes: `obterPagamentosPorAluno(alunoId: string): Pagamento[]` de
  `src/data/pagamentoRepository.ts` (já existe).
- Produces: `registrarCheckin(checkin: CheckIn): void`,
  `obterCheckinsPorAluno(alunoId: string): CheckIn[]`,
  `possuiAcessoLiberado(alunoId: string): boolean`,
  `registrarVisitante(visitante: Visitante): void` — usados pelas Tasks 6 e 8.

- [ ] **Step 1: Criar o tipo CheckIn**

Create `src/types/checkin.ts`:

```ts
// Registro de entrada na catraca. accessGranted é calculado no momento do check-in
// (ver possuiAcessoLiberado em checkinRepository.ts) e fica congelado aqui como
// histórico — a regra em si nunca é salva separada, só recalculada a cada check-in.
export type MetodoCheckin = 'faceId' | 'manual'

export interface CheckIn {
  id: string
  alunoId: string
  timestamp: string
  method: MetodoCheckin
  accessGranted: boolean
}
```

- [ ] **Step 2: Criar o tipo Visitante**

Create `src/types/visitante.ts`:

```ts
// Dia de teste: visitante ainda não é Aluno — não tem plano, não gera pagamento,
// não entra nas métricas de alunos ativos.
export interface Visitante {
  id: string
  name: string
  phone: string
  visitDate: string
}
```

- [ ] **Step 3: Exportar os dois tipos novos no barrel**

Em `src/types/index.ts`, adicione as duas linhas (arquivo completo esperado):

```ts
// Barrel: reúne todos os tipos num só import. Em vez de "from '../types/aluno'",
// o resto do código usa só "from '../types'".
export * from './usuario'
export * from './academia'
export * from './profissional'
export * from './aluno'
export * from './plano'
export * from './atendimento'
export * from './treino'
export * from './meta'
export * from './avaliacaoFisica'
export * from './pagamento'
export * from './financeiro'
export * from './checkin'
export * from './visitante'
```

- [ ] **Step 4: Adicionar os seeds vazios**

Em `src/data/seed.ts`, adicione ao import do topo do arquivo `CheckIn` e `Visitante`,
e adicione estas duas constantes exportadas (podem ficar no final do arquivo):

```ts
export const seedCheckins: CheckIn[] = []

export const seedVisitantes: Visitante[] = []
```

- [ ] **Step 5: Criar o repository de CheckIn com a regra de acesso**

Create `src/data/checkinRepository.ts`:

```ts
import type { CheckIn } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedCheckins } from './seed'
import { obterPagamentosPorAluno } from './pagamentoRepository'

const KEY = 'checkins'

export function inicializarCheckins(): void {
  ensureSeeded<CheckIn>(KEY, seedCheckins)
}

export function obterCheckins(): CheckIn[] {
  return readCollection<CheckIn>(KEY, seedCheckins)
}

export function obterCheckinsPorAluno(alunoId: string): CheckIn[] {
  return obterCheckins().filter((checkin) => checkin.alunoId === alunoId)
}

export function registrarCheckin(checkin: CheckIn): void {
  const current = obterCheckins()
  writeCollection(KEY, [...current, checkin])
}

// Acesso à catraca nunca é salvo — é recalculado a cada check-in: bloqueado se o
// aluno tiver qualquer pagamento com status 'late'.
export function possuiAcessoLiberado(alunoId: string): boolean {
  const pagamentos = obterPagamentosPorAluno(alunoId)
  return !pagamentos.some((pagamento) => pagamento.status === 'late')
}
```

- [ ] **Step 6: Criar o repository de Visitante**

Create `src/data/visitanteRepository.ts`:

```ts
import type { Visitante } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedVisitantes } from './seed'

const KEY = 'visitors'

export function inicializarVisitantes(): void {
  ensureSeeded<Visitante>(KEY, seedVisitantes)
}

export function obterVisitantes(): Visitante[] {
  return readCollection<Visitante>(KEY, seedVisitantes)
}

export function registrarVisitante(visitante: Visitante): void {
  const current = obterVisitantes()
  writeCollection(KEY, [...current, visitante])
}
```

- [ ] **Step 7: Ligar os dois repositories novos no barrel de dados**

Em `src/data/index.ts`, arquivo completo esperado:

```ts
import { inicializarUsuarios } from './usuarioRepository'
import { inicializarAlunos } from './alunoRepository'
import { inicializarProfissionais } from './profissionalRepository'
import { inicializarPlanos } from './planoRepository'
import { inicializarPagamentos } from './pagamentoRepository'
import { inicializarAtendimentos } from './atendimentoRepository'
import { inicializarTreinos } from './treinoRepository'
import { inicializarMetas } from './metaRepository'
import { inicializarAvaliacoesFisicas } from './avaliacaoFisicaRepository'
import { inicializarCheckins } from './checkinRepository'
import { inicializarVisitantes } from './visitanteRepository'

export * from './usuarioRepository'
export * from './alunoRepository'
export * from './profissionalRepository'
export * from './planoRepository'
export * from './pagamentoRepository'
export * from './atendimentoRepository'
export * from './treinoRepository'
export * from './metaRepository'
export * from './avaliacaoFisicaRepository'
export * from './checkinRepository'
export * from './visitanteRepository'

export function inicializarTodosOsDados(): void {
  inicializarUsuarios()
  inicializarAlunos()
  inicializarProfissionais()
  inicializarPlanos()
  inicializarPagamentos()
  inicializarAtendimentos()
  inicializarTreinos()
  inicializarMetas()
  inicializarAvaliacoesFisicas()
  inicializarCheckins()
  inicializarVisitantes()
}
```

- [ ] **Step 8: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Verificar no navegador que o seed inicializou**

Run: `npm run dev`, abra a URL que aparecer no terminal, abra as DevTools do navegador
(F12) → aba Application/Armazenamento → Local Storage → o domínio do app.
Expected: existem as chaves `biggym:checkins` (valor `[]`) e `biggym:visitors`
(valor `[]`), junto com as chaves que já existiam antes.

- [ ] **Step 10: Commit**

```bash
git add src/types/checkin.ts src/types/visitante.ts src/types/index.ts src/data/seed.ts src/data/checkinRepository.ts src/data/visitanteRepository.ts src/data/index.ts
git commit -m "feat: criar entidades CheckIn e Visitante com regra de acesso a catraca"
```

---

### Task 3 (você): Esqueleto de rotas, sidebar e login do papel Atendente

**Quem faz:** você. Depende da Task 1 (papel `'atendente'` precisa existir em
`PapelUsuario`). Esta task cria as 5 páginas do Atendente **como placeholder** (igual os
dashboards de Admin/Profissional/Aluno já são hoje) e liga toda a navegação — depois
dela, as Tasks 4, 5, 6, 8 e 9 só **substituem o conteúdo** de um arquivo que já existe e
já está navegável.

**Files:**
- Create: `src/features/attendant/AttendantDashboardPage.tsx`
- Create: `src/features/attendant/AttendantCadastroPage.tsx`
- Create: `src/features/attendant/AttendantDiaDeTestePage.tsx`
- Create: `src/features/attendant/AttendantCheckinPage.tsx`
- Create: `src/features/attendant/AttendantPagamentoPage.tsx`
- Modify: `src/routes/ProtectedRoute.tsx`
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/features/auth/LoginPage.tsx`

**Interfaces:**
- Produces: rotas `/atendente`, `/atendente/cadastro`, `/atendente/dia-de-teste`,
  `/atendente/checkin`, `/atendente/pagamento/:alunoId`, todas protegidas por
  `allowedRole="atendente"`.

- [ ] **Step 1: Criar as 5 páginas placeholder**

Create `src/features/attendant/AttendantDashboardPage.tsx`:

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AttendantDashboardPage() {
  return (
    <AppLayout>
      <h1>Atendimento</h1>
      <Card>
        <p>Placeholder — busca de aluno e acesso rapido as acoes do atendente entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

Create `src/features/attendant/AttendantCadastroPage.tsx`:

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AttendantCadastroPage() {
  return (
    <AppLayout>
      <h1>Cadastro presencial</h1>
      <Card>
        <p>Placeholder — formulario de matricula presencial entra aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

Create `src/features/attendant/AttendantDiaDeTestePage.tsx`:

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AttendantDiaDeTestePage() {
  return (
    <AppLayout>
      <h1>Dia de teste</h1>
      <Card>
        <p>Placeholder — formulario de registro de visitante entra aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

Create `src/features/attendant/AttendantCheckinPage.tsx`:

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AttendantCheckinPage() {
  return (
    <AppLayout>
      <h1>Check-in</h1>
      <Card>
        <p>Placeholder — busca de aluno e Face ID simulado entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

Create `src/features/attendant/AttendantPagamentoPage.tsx`:

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AttendantPagamentoPage() {
  return (
    <AppLayout>
      <h1>Pagamento no balcao</h1>
      <Card>
        <p>Placeholder — cobranca no balcao entra aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Adicionar `/atendente` ao mapa de rota-inicial por papel**

Em `src/routes/ProtectedRoute.tsx`, dentro de `ROLE_HOME`, adicione a linha
`atendente: '/atendente',` (ordem sugerida: logo depois de `admin`):

```ts
const ROLE_HOME: Record<PapelUsuario, string> = {
  admin: '/admin',
  atendente: '/atendente',
  professional: '/profissional',
  subscriber: '/aluno',
}
```

- [ ] **Step 3: Adicionar as rotas em AppRoutes.tsx**

Em `src/routes/AppRoutes.tsx`, adicione os 5 imports (depois do import de
`AdminDashboardPage`) e as 5 rotas (depois do bloco de rotas `/admin`, antes do bloco
`/profissional`). Arquivo completo esperado:

```tsx
// Mapa central de todas as URLs do app — bate com a seção 5 (Mapa de Paginas) do spec.
// Fica num arquivo só pra dar pra ver todas as rotas existentes numa olhada.
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { MatriculaPage } from '../features/home/MatriculaPage'
import { LoginPage } from '../features/auth/LoginPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { AttendantDashboardPage } from '../features/attendant/AttendantDashboardPage'
import { AttendantCadastroPage } from '../features/attendant/AttendantCadastroPage'
import { AttendantDiaDeTestePage } from '../features/attendant/AttendantDiaDeTestePage'
import { AttendantCheckinPage } from '../features/attendant/AttendantCheckinPage'
import { AttendantPagamentoPage } from '../features/attendant/AttendantPagamentoPage'
import { ProfessionalDashboardPage } from '../features/professional/ProfessionalDashboardPage'
import { SubscriberDashboardPage } from '../features/subscriber/SubscriberDashboardPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/matricula" element={<MatriculaPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/cadastro"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantCadastroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/dia-de-teste"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantDiaDeTestePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/checkin"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantCheckinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atendente/pagamento/:alunoId"
        element={
          <ProtectedRoute allowedRole="atendente">
            <AttendantPagamentoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profissional"
        element={
          <ProtectedRoute allowedRole="professional">
            <ProfessionalDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRole="subscriber">
            <SubscriberDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Adicionar o Atendente na Sidebar**

Em `src/components/layout/Sidebar.tsx`, dentro de `NAV_ITEMS`, adicione a entrada
`atendente` (logo depois de `admin`):

```ts
const NAV_ITEMS: Record<PapelUsuario, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/alunos', label: 'Alunos' },
    { to: '/admin/planos', label: 'Planos' },
    { to: '/admin/profissionais', label: 'Profissionais' },
    { to: '/admin/financeiro', label: 'Financeiro' },
  ],
  atendente: [
    { to: '/atendente', label: 'Atendimento' },
    { to: '/atendente/cadastro', label: 'Cadastrar aluno' },
    { to: '/atendente/dia-de-teste', label: 'Dia de teste' },
    { to: '/atendente/checkin', label: 'Check-in' },
  ],
  professional: [{ to: '/profissional', label: 'Dashboard' }],
  subscriber: [
    { to: '/aluno', label: 'Dashboard' },
    { to: '/aluno/treino', label: 'Treino' },
    { to: '/aluno/evolucao', label: 'Evolucao' },
    { to: '/aluno/financeiro', label: 'Financeiro' },
    { to: '/aluno/perfil', label: 'Perfil' },
  ],
}
```

- [ ] **Step 5: Adicionar o atalho de demo e o ROLE_HOME no Login**

Em `src/features/auth/LoginPage.tsx`, atualize `ROLE_HOME` (igual Step 2) e adicione o
botão de atalho, logo depois do botão "Entrar como Admin":

```tsx
const ROLE_HOME: Record<PapelUsuario, string> = {
  admin: '/admin',
  atendente: '/atendente',
  professional: '/profissional',
  subscriber: '/aluno',
}
```

```tsx
<Button variant="secondary" onClick={() => handleDemoLogin('admin')}>
  Entrar como Admin
</Button>
<Button variant="secondary" onClick={() => handleDemoLogin('atendente')}>
  Entrar como Atendente
</Button>
```

- [ ] **Step 6: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Verificar no navegador**

Run: `npm run dev`. Na tela de login, clique em "Entrar como Atendente".
Expected: você cai em `/atendente`, vê a sidebar com os 4 links do Atendente, e as
páginas `/atendente/cadastro`, `/atendente/dia-de-teste` e `/atendente/checkin`
abrem mostrando o texto "Placeholder — ...".

- [ ] **Step 8: Commit**

```bash
git add src/features/attendant src/routes/ProtectedRoute.tsx src/routes/AppRoutes.tsx src/components/layout/Sidebar.tsx src/features/auth/LoginPage.tsx
git commit -m "feat: criar esqueleto de rotas e paginas do papel atendente"
```

---

### Task 4 (colega — iniciante): Dashboard do Atendente (busca de aluno + atalhos)

**Quem faz:** o colega com menos experiência no grupo. Depende da Task 3 estar no
`main` (o arquivo que você vai editar já existe como placeholder).

**Pasta de trabalho:** só o arquivo `src/features/attendant/AttendantDashboardPage.tsx`
— não precisa tocar em mais nada.

**Contexto pra quem for fazer:** essa tela é a "home" do atendente: um campo de busca
de aluno por nome/CPF, e 3 cartões de atalho pra outras telas do atendente. Toda busca
usa `obterAlunos()`, que já existe em `src/data` e devolve a lista completa de alunos —
o filtro é feito aqui mesmo, em memória.

**Files:**
- Modify: `src/features/attendant/AttendantDashboardPage.tsx`

**Interfaces:**
- Consumes: `obterAlunos(): Aluno[]` de `src/data` (já existe, não precisa criar).

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Replace todo o conteúdo de `src/features/attendant/AttendantDashboardPage.tsx`:

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import { obterAlunos } from '../../data'
import type { Aluno } from '../../types'

export function AttendantDashboardPage() {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<Aluno[]>([])

  function handleBuscar(event: React.FormEvent) {
    event.preventDefault()
    const encontrados = obterAlunos().filter(
      (aluno) =>
        aluno.cpf.includes(termo) || aluno.fullName.toLowerCase().includes(termo.toLowerCase()),
    )
    setResultados(encontrados)
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Atendimento</h1>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <Link to="/atendente/cadastro">
          <Card title="Cadastrar aluno">
            <p className="text-sm text-slate-600">Matricula presencial de quem chegou na academia.</p>
          </Card>
        </Link>
        <Link to="/atendente/dia-de-teste">
          <Card title="Dia de teste">
            <p className="text-sm text-slate-600">Visitante experimenta sem virar aluno ainda.</p>
          </Card>
        </Link>
        <Link to="/atendente/checkin">
          <Card title="Check-in">
            <p className="text-sm text-slate-600">Registrar entrada de um aluno ja cadastrado.</p>
          </Card>
        </Link>
      </section>

      <Card title="Buscar aluno" className="mt-6">
        <form onSubmit={handleBuscar} className="flex items-end gap-2">
          <Input
            id="busca"
            label="CPF ou nome"
            value={termo}
            onChange={(event) => setTermo(event.target.value)}
          />
          <Button type="submit">Buscar</Button>
        </form>
        <ul className="mt-4 flex flex-col gap-2">
          {resultados.map((aluno) => (
            <li key={aluno.id}>
              <Link to={`/atendente/pagamento/${aluno.id}`} className="text-rose-800 hover:underline">
                {aluno.fullName} — {aluno.cpf}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verificar no navegador**

Entre como Atendente (`npm run dev`, botão "Entrar como Atendente"). Na tela inicial,
digite "Joao" no campo de busca e clique em "Buscar".
Expected: aparece um link "Joao Pereira — 333.333.333-33" na lista abaixo do formulário.

- [ ] **Step 4: Commit**

```bash
git add src/features/attendant/AttendantDashboardPage.tsx
git commit -m "feat: implementar busca de aluno no dashboard do atendente"
```

---

### Task 5 (colega — iniciante): Cadastro presencial de aluno

**Quem faz:** colega iniciante. Depende da Task 3. **Não** importe nada de
`src/features/home/MatriculaPage.tsx` — mesmo sendo parecido, copie a lógica pra dentro
deste arquivo (regra do `CONTRIBUTING.md`: uma feature não importa de outra).

**Pasta de trabalho:** só `src/features/attendant/AttendantCadastroPage.tsx`.

**Contexto pra quem for fazer:** esse formulário cria dois registros ao mesmo tempo —
um `Aluno` (dados pessoais + plano) e um `Usuario` (login dele, pra ele poder entrar
depois em `/aluno`). A diferença do cadastro que já existe em `/matricula` é que aqui
**não** faz login automático no final (quem está na tela é o atendente, não o aluno).

**Files:**
- Modify: `src/features/attendant/AttendantCadastroPage.tsx`

**Interfaces:**
- Consumes: `obterPlanos(): Plano[]`, `salvarAluno(aluno: Aluno): void`,
  `salvarUsuario(usuario: Usuario): void`, `buscarUsuarioPorEmail(email: string):
  Usuario | undefined` — todos já existem em `src/data`.

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Replace todo o conteúdo de `src/features/attendant/AttendantCadastroPage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import { obterPlanos, salvarAluno, salvarUsuario, buscarUsuarioPorEmail } from '../../data'
import type { Aluno, Usuario } from '../../types'

export function AttendantCadastroPage() {
  const navigate = useNavigate()
  const planos = obterPlanos()

  const [planoAtualId, setPlanoAtualId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!planoAtualId) {
      setErro('Escolha um plano antes de matricular.')
      return
    }
    if (buscarUsuarioPorEmail(email)) {
      setErro('E-mail ja cadastrado.')
      return
    }

    const alunoId = crypto.randomUUID()
    const aluno: Aluno = {
      id: alunoId,
      fullName,
      weight: 0,
      height: 0,
      phone,
      cpf,
      address,
      birthDate,
      notes: '',
      planoAtualId,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'active',
    }
    const usuario: Usuario = {
      id: crypto.randomUUID(),
      email,
      password,
      role: 'subscriber',
      refId: alunoId,
    }

    salvarAluno(aluno)
    salvarUsuario(usuario)
    setErro('')
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <AppLayout>
        <Card className="max-w-md">
          <p>Aluno cadastrado com sucesso.</p>
          <Button className="mt-4" onClick={() => navigate('/atendente')}>
            Voltar ao atendimento
          </Button>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Cadastro presencial</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-md flex-col gap-4">
        <Input id="fullName" label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input id="phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Input id="cpf" label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
        <Input id="address" label="Endereco" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <Input id="birthDate" label="Data de nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        <Input id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input id="password" label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div>
          <p className="text-sm font-medium text-slate-700">Plano</p>
          <div className="mt-2 flex flex-col gap-2">
            {planos.map((plano) => (
              <button
                key={plano.id}
                type="button"
                onClick={() => setPlanoAtualId(plano.id)}
                className={`rounded-md border p-3 text-left ${
                  planoAtualId === plano.id ? 'border-rose-800 ring-2 ring-rose-800/30' : 'border-slate-300'
                }`}
              >
                {plano.name} — R$ {plano.price.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
        <Button type="submit">Cadastrar</Button>
      </form>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verificar no navegador**

Entre como Atendente, clique em "Cadastrar aluno", preencha o formulário com um e-mail
novo (ex: `teste@biggym.com`), escolha um plano e envie.
Expected: aparece "Aluno cadastrado com sucesso." Clique em "Voltar ao atendimento",
busque pelo nome que você cadastrou no dashboard (Task 4) — ele deve aparecer na lista.

- [ ] **Step 4: Commit**

```bash
git add src/features/attendant/AttendantCadastroPage.tsx
git commit -m "feat: implementar cadastro presencial de aluno pelo atendente"
```

---

### Task 6 (colega — iniciante): Dia de teste

**Quem faz:** colega iniciante (pode ser o mesmo da Task 5 ou outro — não há
dependência entre elas). Depende da Task 2 (repository `registrarVisitante`) e da
Task 3.

**Pasta de trabalho:** só `src/features/attendant/AttendantDiaDeTestePage.tsx`.

**Contexto pra quem for fazer:** essa é a tela mais simples do Atendente — um
formulário de 2 campos que só grava um `Visitante`. Visitante não é Aluno: não tem
plano, não aparece em nenhuma métrica de aluno.

**Files:**
- Modify: `src/features/attendant/AttendantDiaDeTestePage.tsx`

**Interfaces:**
- Consumes: `registrarVisitante(visitante: Visitante): void` de `src/data` (criado na
  Task 2).

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Replace todo o conteúdo de `src/features/attendant/AttendantDiaDeTestePage.tsx`:

```tsx
import { useState } from 'react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import { registrarVisitante } from '../../data'

export function AttendantDiaDeTestePage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sucesso, setSucesso] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    registrarVisitante({
      id: crypto.randomUUID(),
      name,
      phone,
      visitDate: new Date().toISOString().slice(0, 10),
    })
    setSucesso(true)
    setName('')
    setPhone('')
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Dia de teste</h1>
      <Card className="mt-4 max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="name" label="Nome do visitante" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input id="phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          {sucesso ? <p className="text-sm text-green-700">Dia de teste registrado.</p> : null}
          <Button type="submit">Liberar dia de teste</Button>
        </form>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verificar no navegador**

Entre como Atendente, clique em "Dia de teste", preencha nome e telefone, envie.
Expected: aparece "Dia de teste registrado." Abra as DevTools → Local Storage →
`biggym:visitors` deve conter um registro novo.

- [ ] **Step 4: Commit**

```bash
git add src/features/attendant/AttendantDiaDeTestePage.tsx
git commit -m "feat: implementar registro de dia de teste"
```

---

### Task 7 (você): Motor de pagamento (`pagamentoService.ts`)

**Quem faz:** você. Depende da Task 1. Esta é a peça mais reaproveitada do projeto —
Admin (financeiro), Aluno (financeiro) e a Task 9 (pagamento no balcão) vão todas
chamar essas mesmas funções, em vez de cada um simular pagamento do próprio jeito.

**Files:**
- Modify: `package.json` (nova dependência `jspdf`)
- Modify: `src/data/pagamentoRepository.ts`
- Create: `src/data/pagamentoService.ts`

**Interfaces:**
- Consumes: `obterPagamentos(): Pagamento[]` (já existe em `pagamentoRepository.ts`).
- Produces: `processarPagamento(pagamento: Pagamento, paymentMethod: string):
  Promise<{ aprovado: boolean; pagamentoAtualizado: Pagamento }>`,
  `gerarReciboPDF(pagamento: Pagamento, nomeAluno: string): void`,
  `obterResumoFinanceiroMensal(referenceMonth: string): { revenue: number;
  delinquency: number }` — usados pela Task 8, Task 9, e depois pelo Admin (Fase B).

- [ ] **Step 1: Instalar o jsPDF**

Run: `npm install jspdf`
Expected: `package.json` ganha `"jspdf"` em `dependencies`.

- [ ] **Step 2: Adicionar `atualizarPagamento` ao repository existente**

Em `src/data/pagamentoRepository.ts`, troque o import do topo pra incluir
`writeCollection`, e adicione a função nova no final do arquivo. Arquivo completo
esperado:

```ts
import type { Pagamento } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedPagamentos } from './seed'

const KEY = 'payments'

export function inicializarPagamentos(): void {
  ensureSeeded<Pagamento>(KEY, seedPagamentos)
}

export function obterPagamentos(): Pagamento[] {
  return readCollection<Pagamento>(KEY, seedPagamentos)
}

export function obterPagamentosPorAluno(alunoId: string): Pagamento[] {
  return obterPagamentos().filter((pagamento) => pagamento.alunoId === alunoId)
}

export function atualizarPagamento(pagamento: Pagamento): void {
  const current = obterPagamentos()
  const updated = current.map((item) => (item.id === pagamento.id ? pagamento : item))
  writeCollection(KEY, updated)
}
```

- [ ] **Step 3: Criar o motor de pagamento**

Create `src/data/pagamentoService.ts`:

```ts
import jsPDF from 'jspdf'
import type { Pagamento } from '../types'
import { obterPagamentos, atualizarPagamento } from './pagamentoRepository'

const DELAY_SIMULADO_MS = 1200

function proximoNumeroRecibo(): string {
  const pagamentos = obterPagamentos()
  const quantidadeComRecibo = pagamentos.filter((pagamento) => pagamento.receiptNumber).length
  return `REC-${String(quantidadeComRecibo + 1).padStart(4, '0')}`
}

function calcularMultaJuros(pagamento: Pagamento): number {
  const hoje = new Date()
  const vencimento = new Date(pagamento.dueDate)
  if (hoje <= vencimento) return 0
  const diasAtraso = Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))
  return Number((pagamento.originalValue * 0.02 + diasAtraso * 1.5).toFixed(2))
}

export interface ResultadoProcessamento {
  aprovado: boolean
  pagamentoAtualizado: Pagamento
}

// Simulação: sempre tem um delay (parece processamento real) e recusa ~10% das vezes
// pra existir caminho de erro pra tratar na tela. Nenhuma integração real de pagamento.
export async function processarPagamento(
  pagamento: Pagamento,
  paymentMethod: string,
): Promise<ResultadoProcessamento> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_SIMULADO_MS))

  const aprovado = Math.random() > 0.1

  if (!aprovado) {
    return { aprovado: false, pagamentoAtualizado: pagamento }
  }

  const multa = calcularMultaJuros(pagamento)
  const pagamentoAtualizado: Pagamento = {
    ...pagamento,
    paidValue: pagamento.originalValue + multa,
    lateFee: multa,
    paymentMethod,
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    receiptNumber: proximoNumeroRecibo(),
  }

  atualizarPagamento(pagamentoAtualizado)

  return { aprovado: true, pagamentoAtualizado }
}

export function gerarReciboPDF(pagamento: Pagamento, nomeAluno: string): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('BigGym - Recibo de Pagamento', 20, 20)
  doc.setFontSize(12)
  doc.text(`Recibo: ${pagamento.receiptNumber ?? ''}`, 20, 40)
  doc.text(`Aluno: ${nomeAluno}`, 20, 50)
  doc.text(`Valor pago: R$ ${(pagamento.paidValue ?? 0).toFixed(2)}`, 20, 60)
  doc.text(`Data do pagamento: ${pagamento.paymentDate ?? ''}`, 20, 70)
  doc.text(`Metodo: ${pagamento.paymentMethod ?? ''}`, 20, 80)
  doc.save(`${pagamento.receiptNumber ?? 'recibo'}.pdf`)
}

export interface ResumoFinanceiroMensal {
  revenue: number
  delinquency: number
}

// mesReferencia no formato 'YYYY-MM'. Nunca digitado — sempre derivado de Pagamento.
export function obterResumoFinanceiroMensal(mesReferencia: string): ResumoFinanceiroMensal {
  const pagamentosDoMes = obterPagamentos().filter((pagamento) => pagamento.dueDate.slice(0, 7) === mesReferencia)

  const revenue = pagamentosDoMes
    .filter((pagamento) => pagamento.status === 'paid')
    .reduce((total, pagamento) => total + (pagamento.paidValue ?? 0), 0)

  const delinquency = pagamentosDoMes
    .filter((pagamento) => pagamento.status === 'late')
    .reduce((total, pagamento) => total + pagamento.originalValue + pagamento.lateFee, 0)

  return { revenue, delinquency }
}
```

- [ ] **Step 4: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/data/pagamentoRepository.ts src/data/pagamentoService.ts
git commit -m "feat: criar motor de pagamento simulado com recibo em PDF e resumo financeiro"
```

---

### Task 8 (você): Check-in com Face ID simulado

**Quem faz:** você. Depende da Task 2 (`possuiAcessoLiberado`, `registrarCheckin`) e
da Task 3.

**Files:**
- Create: `src/features/attendant/FaceIdPreview.tsx`
- Modify: `src/features/attendant/AttendantCheckinPage.tsx`

**Interfaces:**
- Consumes: `obterAlunos(): Aluno[]`, `possuiAcessoLiberado(alunoId: string): boolean`,
  `registrarCheckin(checkin: CheckIn): void` (Task 2).

- [ ] **Step 1: Criar o componente de preview de câmera**

Create `src/features/attendant/FaceIdPreview.tsx`:

```tsx
import { useEffect, useRef } from 'react'

// Fica só nesta feature (não em components/common) porque hoje só o check-in do
// Atendente usa isso — se outra tela precisar no futuro, promove pra common.
// O catch fica mudo de propósito: sem câmera disponível, a simulação de
// reconhecimento continua (ver AttendantCheckinPage), só sem o preview de vídeo.
export function FaceIdPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      })
      .catch(() => {})

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="h-40 w-40 rounded-full border-4 border-rose-800/30 object-cover"
    />
  )
}
```

- [ ] **Step 2: Substituir o conteúdo da página de check-in**

Replace todo o conteúdo de `src/features/attendant/AttendantCheckinPage.tsx`:

```tsx
import { useState } from 'react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import { obterAlunos, possuiAcessoLiberado, registrarCheckin } from '../../data'
import type { Aluno } from '../../types'
import { FaceIdPreview } from './FaceIdPreview'

type Etapa = 'busca' | 'reconhecendo' | 'resultado'

export function AttendantCheckinPage() {
  const [termo, setTermo] = useState('')
  const [alunoEncontrado, setAlunoEncontrado] = useState<Aluno | null>(null)
  const [etapa, setEtapa] = useState<Etapa>('busca')
  const [acessoLiberado, setAcessoLiberado] = useState(false)
  const [erro, setErro] = useState('')

  function handleBuscar(event: React.FormEvent) {
    event.preventDefault()
    const encontrado = obterAlunos().find(
      (aluno) => aluno.cpf === termo || aluno.fullName.toLowerCase().includes(termo.toLowerCase()),
    )
    if (!encontrado) {
      setErro('Aluno nao encontrado.')
      return
    }
    setErro('')
    setAlunoEncontrado(encontrado)
    setEtapa('reconhecendo')

    setTimeout(() => {
      const liberado = possuiAcessoLiberado(encontrado.id)
      registrarCheckin({
        id: crypto.randomUUID(),
        alunoId: encontrado.id,
        timestamp: new Date().toISOString(),
        method: 'faceId',
        accessGranted: liberado,
      })
      setAcessoLiberado(liberado)
      setEtapa('resultado')
    }, 1500)
  }

  function handleNovaBusca() {
    setTermo('')
    setAlunoEncontrado(null)
    setEtapa('busca')
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Check-in</h1>

      {etapa === 'busca' ? (
        <Card className="mt-4 max-w-md">
          <form onSubmit={handleBuscar} className="flex flex-col gap-4">
            <Input id="termo" label="CPF ou nome do aluno" value={termo} onChange={(event) => setTermo(event.target.value)} required />
            {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
            <Button type="submit">Buscar e reconhecer</Button>
          </form>
        </Card>
      ) : null}

      {etapa === 'reconhecendo' && alunoEncontrado ? (
        <Card className="mt-4 max-w-md">
          <p className="text-slate-600">Reconhecendo {alunoEncontrado.fullName} via Face ID (simulado)...</p>
          <div className="mt-4">
            <FaceIdPreview />
          </div>
        </Card>
      ) : null}

      {etapa === 'resultado' && alunoEncontrado ? (
        <Card className="mt-4 max-w-md">
          <p className="font-semibold">{alunoEncontrado.fullName}</p>
          {acessoLiberado ? (
            <p className="mt-2 text-green-700">Acesso liberado. Catraca aberta.</p>
          ) : (
            <p className="mt-2 text-red-600">Acesso bloqueado: pagamento em atraso.</p>
          )}
          <Button variant="secondary" className="mt-4" onClick={handleNovaBusca}>
            Novo check-in
          </Button>
        </Card>
      ) : null}
    </AppLayout>
  )
}
```

- [ ] **Step 3: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Verificar no navegador**

Entre como Atendente, clique em "Check-in", digite "Joao" e envie.
Expected: o navegador provavelmente pede permissão de câmera (aceite ou recuse — nos
dois casos a simulação segue); depois de ~1.5s aparece "Acesso liberado. Catraca
aberta." (porque `sub-1` no seed só tem pagamento `paid`). Pra ver o caminho de
bloqueio, repita a busca por "Marina" — ela tem o pagamento `pending` no seed, então
ainda está liberada; esse cenário de bloqueio só aparece de fato depois que algum
pagamento virar `late` (isso acontece naturalmente depois que a Fase B simular o
vencimento, ou você pode forçar manualmente editando `biggym:payments` no Local
Storage pra testar agora).

- [ ] **Step 5: Commit**

```bash
git add src/features/attendant/FaceIdPreview.tsx src/features/attendant/AttendantCheckinPage.tsx
git commit -m "feat: implementar check-in com face id simulado e regra de acesso a catraca"
```

---

### Task 9 (colega — iniciante/intermediário): Pagamento no balcão

**Quem faz:** colega do grupo (pode ser um com um pouco mais de confiança, já que lida
com `async/await`). **Só pode começar depois que a Task 7 estiver no `main`** — esta
tela depende de `pagamentoService.ts` existir.

**Pasta de trabalho:** só `src/features/attendant/AttendantPagamentoPage.tsx`.

**Contexto pra quem for fazer:** essa tela recebe o id do aluno pela URL (`:alunoId`),
acha o pagamento pendente dele, e usa duas funções que já existem (`processarPagamento`
e `gerarReciboPDF`, de `src/data/pagamentoService.ts`) — não precisa simular nada do
zero, só chamar e mostrar o resultado na tela.

**Files:**
- Modify: `src/features/attendant/AttendantPagamentoPage.tsx`

**Interfaces:**
- Consumes: `obterAlunoPorId(id: string): Aluno | undefined`,
  `obterPagamentosPorAluno(alunoId: string): Pagamento[]` (de `src/data`),
  `processarPagamento`, `gerarReciboPDF` (de `src/data/pagamentoService.ts`, Task 7).

- [ ] **Step 1: Substituir o conteúdo do arquivo**

Replace todo o conteúdo de `src/features/attendant/AttendantPagamentoPage.tsx`:

```tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout'
import { Button, Card } from '../../components/common'
import { obterAlunoPorId, obterPagamentosPorAluno } from '../../data'
import { processarPagamento, gerarReciboPDF } from '../../data/pagamentoService'

export function AttendantPagamentoPage() {
  const { alunoId } = useParams<{ alunoId: string }>()
  const aluno = alunoId ? obterAlunoPorId(alunoId) : undefined
  const pagamentoPendente = alunoId
    ? obterPagamentosPorAluno(alunoId).find((pagamento) => pagamento.status !== 'paid')
    : undefined

  const [processando, setProcessando] = useState(false)
  const [resultado, setResultado] = useState<'aprovado' | 'recusado' | null>(null)

  async function handlePagar(metodo: string) {
    if (!pagamentoPendente) return
    setProcessando(true)
    const { aprovado, pagamentoAtualizado } = await processarPagamento(pagamentoPendente, metodo)
    setProcessando(false)
    setResultado(aprovado ? 'aprovado' : 'recusado')
    if (aprovado && aluno) {
      gerarReciboPDF(pagamentoAtualizado, aluno.fullName)
    }
  }

  if (!aluno) {
    return (
      <AppLayout>
        <p>Aluno nao encontrado.</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Pagamento no balcao — {aluno.fullName}</h1>

      {!pagamentoPendente ? (
        <Card className="mt-4 max-w-md">
          <p>Este aluno nao tem pagamento pendente.</p>
        </Card>
      ) : (
        <Card className="mt-4 max-w-md">
          <p>Valor: R$ {pagamentoPendente.originalValue.toFixed(2)}</p>
          <p className="text-sm text-slate-600">Vencimento: {pagamentoPendente.dueDate}</p>
          <div className="mt-4 flex gap-2">
            <Button disabled={processando} onClick={() => handlePagar('cash')}>
              Pagar em dinheiro
            </Button>
            <Button disabled={processando} variant="secondary" onClick={() => handlePagar('card')}>
              Pagar no cartao
            </Button>
          </div>
          {processando ? <p className="mt-2 text-slate-600">Processando pagamento...</p> : null}
          {resultado === 'aprovado' ? <p className="mt-2 text-green-700">Pagamento aprovado. Recibo gerado.</p> : null}
          {resultado === 'recusado' ? <p className="mt-2 text-red-600">Pagamento recusado. Tente novamente.</p> : null}
        </Card>
      )}
    </AppLayout>
  )
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Verificar no navegador**

Entre como Atendente, busque por "Marina" no dashboard (ela tem pagamento `pending` no
seed), clique no link dela — você cai em `/atendente/pagamento/sub-2`.
Expected: aparece o valor e a data de vencimento. Clique em "Pagar em dinheiro" —
depois de ~1.2s aparece "Processando..." e depois "Pagamento aprovado. Recibo gerado."
(ou "recusado", já que há ~10% de chance — tente de novo se cair nesse caso) e um
arquivo `REC-00XX.pdf` deve baixar no navegador.

- [ ] **Step 4: Commit**

```bash
git add src/features/attendant/AttendantPagamentoPage.tsx
git commit -m "feat: implementar pagamento no balcao com recibo em pdf"
```

---

## Depois desta Fase A

Com as 9 tasks prontas, o papel Atendente está completo e navegável, e três peças
ficam disponíveis pra Fase B (ver seção 6 do spec): `pagamentoService.ts` (motor de
pagamento/financeiro), o padrão de tela completo (form → repository → regra de negócio
→ feedback), e o modelo de dados todo atualizado. A Fase B (Admin, Profissional, Aluno)
deve ganhar um plano próprio, escrito depois que esta Fase A estiver no `main` — cada
task de lá vai poder apontar pra um arquivo concreto desta fase como exemplo de padrão
a copiar.
