# BigGym — Esqueleto Compartilhado (Fase 1, Semana 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o esqueleto compartilhado do BigGym (setup do projeto, tipos, camada de dados mockados, store, componentes de UI, layout e roteamento com login mockado) para que as 4 pessoas do grupo possam plugar suas features (`admin`, `professional`, `subscriber`, `financial`) em paralelo sem redefinir contratos.

**Architecture:** Camadas isoladas conforme decidido com o usuário: `types` (contratos de dados) → `data` (localStorage + seed, esconde persistência) → `store` (Zustand, estado de sessão) → `components/common` e `components/layout` (UI reutilizável, sem lógica de negócio) → `routes` + `features` (telas, protegidas por papel). Cada feature só pode importar de `types`, `data`, `store`, `components` e `utils` — nunca de outra feature.

**Tech Stack:** React 18 + Vite 5 + TypeScript 5, Tailwind CSS 3, React Router DOM 6, Zustand 4, persistência em `localStorage`.

## Global Constraints

- Código (nomes de arquivo, tipos, variáveis, funções) em **inglês**. Textos de UI, rotas de URL, documentação e mensagens de commit em **português**.
- Entidades em inglês conforme mapeamento: `User`, `Gym`, `Professional`, `Subscriber`, `Plan`, `PlanHistory`, `Assignment`, `Workout`, `Goal`, `PhysicalAssessment`, `Payment`, `Financial`.
- Pastas de feature em inglês: `src/features/{admin, professional, subscriber, auth, financial}`.
- Nenhuma feature importa de outra feature. Qualquer coisa compartilhada sobe para `components`, `utils`, `data` ou `types`.
- Sem backend real — toda persistência é `localStorage`, com seed inicial se a chave não existir.
- Sem framework de testes no stack (não exigido pelo spec); verificação é via `npx tsc --noEmit` (type-check) e `npm run build` a cada task, mais checagem manual no navegador na task de integração final.

---

## File Structure

```
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
tailwind.config.js
postcss.config.js
index.html
src/
  main.tsx
  App.tsx
  index.css
  types/
    user.ts
    gym.ts
    professional.ts
    subscriber.ts
    plan.ts
    assignment.ts
    workout.ts
    goal.ts
    physicalAssessment.ts
    payment.ts
    financial.ts
    index.ts
  data/
    storage.ts
    seed.ts
    userRepository.ts
    subscriberRepository.ts
    professionalRepository.ts
    planRepository.ts
    paymentRepository.ts
    index.ts
  store/
    authStore.ts
  components/
    common/
      Button.tsx
      Input.tsx
      Card.tsx
      Table.tsx
      Modal.tsx
      index.ts
    layout/
      AppLayout.tsx
      Sidebar.tsx
      index.ts
  features/
    auth/
      LoginPage.tsx
    admin/
      AdminDashboardPage.tsx
    professional/
      ProfessionalDashboardPage.tsx
    subscriber/
      SubscriberDashboardPage.tsx
    financial/
      .gitkeep
  routes/
    ProtectedRoute.tsx
    AppRoutes.tsx
CONTRIBUTING.md
```

---

### Task 1: Scaffold do projeto (Vite + React + TypeScript + Tailwind + Router + Zustand)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

**Interfaces:**
- Produces: comando `npm run build` funcional; `npm run dev` servindo em `http://localhost:5173`.

- [x] **Step 1: Criar `package.json`**

```json
{
  "name": "biggym",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.3"
  }
}
```

- [x] **Step 2: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [x] **Step 3: Criar `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [x] **Step 4: Criar `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 5: Criar `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Criar `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [x] **Step 7: Criar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BigGym</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [x] **Step 8: Criar `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
}
```

- [x] **Step 9: Criar `src/App.tsx` (placeholder, substituído na Task 8)**

```tsx
function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-semibold">BigGym</h1>
    </div>
  )
}

export default App
```

- [x] **Step 10: Criar `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [x] **Step 11: Instalar dependências e verificar build**

Run: `npm install`
Expected: instala sem erro (cria `node_modules/` e `package-lock.json`, já ignorados pelo `.gitignore` existente).

Run: `npm run build`
Expected: `tsc -b` e `vite build` terminam sem erro, gerando `dist/`.

- [x] **Step 12: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js index.html src/main.tsx src/App.tsx src/index.css
git commit -m "chore: inicializar projeto Vite + React + TypeScript + Tailwind"
```

---

### Task 2: Renomear pastas de feature para inglês e criar pasta financial

**Files:**
- Modify: `src/features/aluno/.gitkeep` → remover, criar `src/features/subscriber/.gitkeep`
- Modify: `src/features/profissional/.gitkeep` → remover, criar `src/features/professional/.gitkeep`
- Create: `src/features/financial/.gitkeep`

**Interfaces:**
- Produces: pastas `src/features/{admin, professional, subscriber, auth, financial}` existentes e rastreadas pelo Git.

- [x] **Step 1: Renomear as pastas**

Run:
```bash
git mv src/features/aluno/.gitkeep src/features/subscriber/.gitkeep
git mv src/features/profissional/.gitkeep src/features/professional/.gitkeep
mkdir -p src/features/financial
touch src/features/financial/.gitkeep
git add src/features/financial/.gitkeep
```

- [x] **Step 2: Verificar estrutura**

Run: `find src/features -type f`
Expected:
```
src/features/admin/.gitkeep
src/features/auth/.gitkeep
src/features/financial/.gitkeep
src/features/professional/.gitkeep
src/features/subscriber/.gitkeep
```

- [x] **Step 3: Commit**

```bash
git commit -m "chore: renomear pastas de feature para ingles e adicionar financial"
```

---

### Task 3: Tipos das entidades (`src/types`)

**Files:**
- Create: `src/types/user.ts`
- Create: `src/types/gym.ts`
- Create: `src/types/professional.ts`
- Create: `src/types/subscriber.ts`
- Create: `src/types/plan.ts`
- Create: `src/types/assignment.ts`
- Create: `src/types/workout.ts`
- Create: `src/types/goal.ts`
- Create: `src/types/physicalAssessment.ts`
- Create: `src/types/payment.ts`
- Create: `src/types/financial.ts`
- Create: `src/types/index.ts`

**Interfaces:**
- Consumes: nada (camada raiz).
- Produces: todos os tipos usados pelas tasks seguintes, exportados a partir de `src/types/index.ts`.

- [ ] **Step 1: Criar `src/types/user.ts`**

```typescript
export type UserRole = 'admin' | 'professional' | 'subscriber'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  refId: string
}
```

- [ ] **Step 2: Criar `src/types/gym.ts`**

```typescript
export interface Gym {
  id: string
  name: string
  address: string
  phone: string
}
```

- [ ] **Step 3: Criar `src/types/professional.ts`**

```typescript
export type ProfessionalBaseType = 'instructor' | 'personalTrainer'

export interface Professional {
  id: string
  name: string
  cpf: string
  phone: string
  birthDate: string
  baseType: ProfessionalBaseType
  specialization: string
  notes: string
}
```

- [ ] **Step 4: Criar `src/types/subscriber.ts`**

```typescript
export interface Subscriber {
  id: string
  fullName: string
  weight: number
  height: number
  phone: string
  cpf: string
  address: string
  birthDate: string
  notes: string
  currentPlanId: string
  startDate: string
}
```

- [ ] **Step 5: Criar `src/types/plan.ts`**

```typescript
export interface Plan {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
}

export interface PlanHistory {
  id: string
  subscriberId: string
  planId: string
  startDate: string
  endDate: string | null
}
```

- [ ] **Step 6: Criar `src/types/assignment.ts`**

```typescript
export type AssignmentType = 'standard' | 'personal'

export interface Assignment {
  id: string
  subscriberId: string
  professionalId: string
  type: AssignmentType
  value?: number
}
```

- [ ] **Step 7: Criar `src/types/workout.ts`**

```typescript
export interface WorkoutExercise {
  name: string
  sets: number
  reps: number
}

export interface Workout {
  id: string
  subscriberId: string
  assignmentId: string
  week: number
  exercises: WorkoutExercise[]
  startDate: string
  active: boolean
  origin: 'manual' | 'suggested'
}
```

- [ ] **Step 8: Criar `src/types/goal.ts`**

```typescript
export type GoalType = 'weight' | 'measurement' | 'frequency'
export type GoalStatus = 'inProgress' | 'completed' | 'late'

export interface Goal {
  id: string
  subscriberId: string
  professionalId: string
  description: string
  type: GoalType
  targetValue: number
  deadline: string
  status: GoalStatus
}
```

- [ ] **Step 9: Criar `src/types/physicalAssessment.ts`**

```typescript
export interface PhysicalAssessment {
  id: string
  subscriberId: string
  objective: string
  description: string
  notes: string
  assessmentDate: string
  weight: number
  measurements: Record<string, number>
}
```

- [ ] **Step 10: Criar `src/types/payment.ts`**

```typescript
export type PaymentStatus = 'pending' | 'paid' | 'late'

export interface Payment {
  id: string
  gymId: string
  subscriberId: string
  planId: string
  originalValue: number
  paidValue: number | null
  lateFee: number
  paymentMethod: string | null
  dueDate: string
  paymentDate: string | null
  status: PaymentStatus
  receiptNumber: string | null
}
```

- [ ] **Step 11: Criar `src/types/financial.ts`**

```typescript
export interface Financial {
  id: string
  gymId: string
  referenceMonth: string
  revenue: number
  expenses: number
  delinquency: number
}
```

- [ ] **Step 12: Criar `src/types/index.ts` (barrel)**

```typescript
export * from './user'
export * from './gym'
export * from './professional'
export * from './subscriber'
export * from './plan'
export * from './assignment'
export * from './workout'
export * from './goal'
export * from './physicalAssessment'
export * from './payment'
export * from './financial'
```

- [ ] **Step 13: Verificar type-check**

Run: `npm run typecheck`
Expected: sem erros (nenhum arquivo em `src/types` é consumido ainda, então só valida sintaxe/tipos).

- [ ] **Step 14: Commit**

```bash
git add src/types
git commit -m "feat: definir tipos das entidades do dominio em ingles"
```

---

### Task 4: Camada de dados mockados (`src/data`)

**Files:**
- Create: `src/data/storage.ts`
- Create: `src/data/seed.ts`
- Create: `src/data/userRepository.ts`
- Create: `src/data/subscriberRepository.ts`
- Create: `src/data/professionalRepository.ts`
- Create: `src/data/planRepository.ts`
- Create: `src/data/paymentRepository.ts`
- Create: `src/data/index.ts`

**Interfaces:**
- Consumes: todos os tipos de `src/types`.
- Produces: `initAllData()`, `getUsers()`, `findUserByCredentials(email, password)`, `findDemoUserByRole(role)`, `getSubscribers()`, `getSubscriberById(id)`, `getProfessionals()`, `getPlans()`, `getPaymentsBySubscriber(subscriberId)` — usados pela Task 5 (store) e pelas features depois.

- [ ] **Step 1: Criar `src/data/storage.ts`**

```typescript
const PREFIX = 'biggym:'

export function readCollection<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return fallback
  return JSON.parse(raw) as T[]
}

export function writeCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items))
}

export function ensureSeeded<T>(key: string, seedData: T[]): void {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) {
    writeCollection(key, seedData)
  }
}
```

- [ ] **Step 2: Criar `src/data/seed.ts`**

```typescript
import type { User, Gym, Professional, Subscriber, Plan, Payment } from '../types'

export const seedGyms: Gym[] = [
  { id: 'gym-1', name: 'BigGym Centro', address: 'Rua das Academias, 100', phone: '(11) 4000-0000' },
]

export const seedPlans: Plan[] = [
  { id: 'plan-1', name: 'Mensal Basico', price: 99.9, modalities: ['Musculacao'], conditions: 'Sem fidelidade' },
  { id: 'plan-2', name: 'Trimestral Plus', price: 259.9, modalities: ['Musculacao', 'Funcional'], conditions: '3 meses, 10% de desconto' },
]

export const seedProfessionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Carla Mendes',
    cpf: '111.111.111-11',
    phone: '(11) 90000-0001',
    birthDate: '1990-04-12',
    baseType: 'instructor',
    specialization: 'Musculacao',
    notes: '',
  },
  {
    id: 'prof-2',
    name: 'Bruno Alves',
    cpf: '222.222.222-22',
    phone: '(11) 90000-0002',
    birthDate: '1988-09-03',
    baseType: 'personalTrainer',
    specialization: 'Treinamento funcional',
    notes: '',
  },
]

export const seedSubscribers: Subscriber[] = [
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
    currentPlanId: 'plan-1',
    startDate: '2026-01-10',
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
    currentPlanId: 'plan-2',
    startDate: '2026-02-01',
  },
]

export const seedPayments: Payment[] = [
  {
    id: 'pay-1',
    gymId: 'gym-1',
    subscriberId: 'sub-1',
    planId: 'plan-1',
    originalValue: 99.9,
    paidValue: 99.9,
    lateFee: 0,
    paymentMethod: 'pix',
    dueDate: '2026-10-10',
    paymentDate: '2026-10-09',
    status: 'paid',
    receiptNumber: 'REC-0001',
  },
  {
    id: 'pay-2',
    gymId: 'gym-1',
    subscriberId: 'sub-2',
    planId: 'plan-2',
    originalValue: 259.9,
    paidValue: null,
    lateFee: 0,
    paymentMethod: null,
    dueDate: '2026-11-01',
    paymentDate: null,
    status: 'pending',
    receiptNumber: null,
  },
]

export const seedUsers: User[] = [
  { id: 'user-admin', email: 'admin@biggym.com', password: 'admin123', role: 'admin', refId: 'gym-1' },
  { id: 'user-prof', email: 'profissional@biggym.com', password: 'prof123', role: 'professional', refId: 'prof-1' },
  { id: 'user-sub', email: 'aluno@biggym.com', password: 'aluno123', role: 'subscriber', refId: 'sub-1' },
]
```

- [ ] **Step 3: Criar `src/data/userRepository.ts`**

```typescript
import type { User, UserRole } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedUsers } from './seed'

const KEY = 'users'

export function initUsers(): void {
  ensureSeeded<User>(KEY, seedUsers)
}

export function getUsers(): User[] {
  return readCollection<User>(KEY, seedUsers)
}

export function findUserByCredentials(email: string, password: string): User | undefined {
  return getUsers().find((user) => user.email === email && user.password === password)
}

export function findDemoUserByRole(role: UserRole): User | undefined {
  return getUsers().find((user) => user.role === role)
}
```

- [ ] **Step 4: Criar `src/data/subscriberRepository.ts`**

```typescript
import type { Subscriber } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedSubscribers } from './seed'

const KEY = 'subscribers'

export function initSubscribers(): void {
  ensureSeeded<Subscriber>(KEY, seedSubscribers)
}

export function getSubscribers(): Subscriber[] {
  return readCollection<Subscriber>(KEY, seedSubscribers)
}

export function getSubscriberById(id: string): Subscriber | undefined {
  return getSubscribers().find((subscriber) => subscriber.id === id)
}

export function saveSubscriber(subscriber: Subscriber): void {
  const current = getSubscribers()
  const index = current.findIndex((item) => item.id === subscriber.id)
  if (index === -1) {
    writeCollection(KEY, [...current, subscriber])
  } else {
    const updated = [...current]
    updated[index] = subscriber
    writeCollection(KEY, updated)
  }
}
```

- [ ] **Step 5: Criar `src/data/professionalRepository.ts`**

```typescript
import type { Professional } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedProfessionals } from './seed'

const KEY = 'professionals'

export function initProfessionals(): void {
  ensureSeeded<Professional>(KEY, seedProfessionals)
}

export function getProfessionals(): Professional[] {
  return readCollection<Professional>(KEY, seedProfessionals)
}

export function getProfessionalById(id: string): Professional | undefined {
  return getProfessionals().find((professional) => professional.id === id)
}
```

- [ ] **Step 6: Criar `src/data/planRepository.ts`**

```typescript
import type { Plan } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPlans } from './seed'

const KEY = 'plans'

export function initPlans(): void {
  ensureSeeded<Plan>(KEY, seedPlans)
}

export function getPlans(): Plan[] {
  return readCollection<Plan>(KEY, seedPlans)
}

export function getPlanById(id: string): Plan | undefined {
  return getPlans().find((plan) => plan.id === id)
}
```

- [ ] **Step 7: Criar `src/data/paymentRepository.ts`**

```typescript
import type { Payment } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPayments } from './seed'

const KEY = 'payments'

export function initPayments(): void {
  ensureSeeded<Payment>(KEY, seedPayments)
}

export function getPayments(): Payment[] {
  return readCollection<Payment>(KEY, seedPayments)
}

export function getPaymentsBySubscriber(subscriberId: string): Payment[] {
  return getPayments().filter((payment) => payment.subscriberId === subscriberId)
}
```

- [ ] **Step 8: Criar `src/data/index.ts` (barrel + init geral)**

```typescript
import { initUsers } from './userRepository'
import { initSubscribers } from './subscriberRepository'
import { initProfessionals } from './professionalRepository'
import { initPlans } from './planRepository'
import { initPayments } from './paymentRepository'

export * from './userRepository'
export * from './subscriberRepository'
export * from './professionalRepository'
export * from './planRepository'
export * from './paymentRepository'

export function initAllData(): void {
  initUsers()
  initSubscribers()
  initProfessionals()
  initPlans()
  initPayments()
}
```

- [ ] **Step 9: Verificar type-check**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 10: Commit**

```bash
git add src/data
git commit -m "feat: criar camada de dados mockados com seed e localStorage"
```

---

### Task 5: Store de autenticação (Zustand)

**Files:**
- Create: `src/store/authStore.ts`

**Interfaces:**
- Consumes: `User`, `UserRole` de `src/types`; `findUserByCredentials`, `findDemoUserByRole` de `src/data`.
- Produces: `useAuthStore` com estado `currentUser: User | null` e ações `login(email, password): boolean`, `loginAsDemo(role: UserRole): void`, `logout(): void` — usado pelas Tasks 7 (routes) e 8 (login page).

- [ ] **Step 1: Criar `src/store/authStore.ts`**

```typescript
import { create } from 'zustand'
import type { User, UserRole } from '../types'
import { findUserByCredentials, findDemoUserByRole } from '../data'

const SESSION_KEY = 'biggym:session'

interface AuthState {
  currentUser: User | null
  login: (email: string, password: string) => boolean
  loginAsDemo: (role: UserRole) => boolean
  logout: () => void
}

function loadSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

function persistSession(user: User | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: loadSession(),
  login: (email, password) => {
    const user = findUserByCredentials(email, password)
    if (!user) return false
    persistSession(user)
    set({ currentUser: user })
    return true
  },
  loginAsDemo: (role) => {
    const user = findDemoUserByRole(role)
    if (!user) return false
    persistSession(user)
    set({ currentUser: user })
    return true
  },
  logout: () => {
    persistSession(null)
    set({ currentUser: null })
  },
}))
```

- [ ] **Step 2: Verificar type-check**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/store
git commit -m "feat: criar store de autenticacao com sessao persistida"
```

---

### Task 6: Componentes de UI compartilhados (`src/components/common`)

**Files:**
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Input.tsx`
- Create: `src/components/common/Card.tsx`
- Create: `src/components/common/Table.tsx`
- Create: `src/components/common/Modal.tsx`
- Create: `src/components/common/index.ts`

**Interfaces:**
- Consumes: nada de `data`/`store` (componentes "burros", só props).
- Produces: `Button`, `Input`, `Card`, `Table<T>`, `Modal` exportados de `src/components/common/index.ts` — consumidos pela Task 7 (layout) e pelas features depois.

- [ ] **Step 1: Criar `src/components/common/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-gold text-slate-950 hover:bg-gold/90',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Criar `src/components/common/Input.tsx`**

```tsx
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-300" htmlFor={id}>
      {label}
      <input
        id={id}
        className={`rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-gold ${className}`}
        {...props}
      />
    </label>
  )
}
```

- [ ] **Step 3: Criar `src/components/common/Card.tsx`**

```tsx
import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20 ${className}`}>
      {title ? <h3 className="mb-3 text-lg font-semibold text-slate-100">{title}</h3> : null}
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Criar `src/components/common/Table.tsx`**

```tsx
interface Column<T> {
  header: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}

export function Table<T>({ columns, rows, rowKey, emptyMessage = 'Nenhum registro encontrado.' }: TableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400">
          {columns.map((column) => (
            <th key={column.header} className="py-2 font-medium">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-slate-800/60 text-slate-200">
            {columns.map((column) => (
              <td key={column.header} className="py-2">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 5: Criar `src/components/common/Modal.tsx`**

```tsx
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100" aria-label="Fechar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Criar `src/components/common/index.ts`**

```typescript
export * from './Button'
export * from './Input'
export * from './Card'
export * from './Table'
export * from './Modal'
```

- [ ] **Step 7: Verificar type-check**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add src/components/common
git commit -m "feat: criar componentes de UI compartilhados (Button, Input, Card, Table, Modal)"
```

---

### Task 7: Layout por papel (`src/components/layout`)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/layout/index.ts`

**Interfaces:**
- Consumes: `useAuthStore` de `src/store/authStore`; `UserRole` de `src/types`.
- Produces: `AppLayout` (recebe `children`) usado pelas páginas das features na Task 8.

- [ ] **Step 1: Criar `src/components/layout/Sidebar.tsx`**

```tsx
import { NavLink } from 'react-router-dom'
import type { UserRole } from '../../types'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/alunos', label: 'Alunos' },
    { to: '/admin/planos', label: 'Planos' },
    { to: '/admin/profissionais', label: 'Profissionais' },
    { to: '/admin/financeiro', label: 'Financeiro' },
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

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 flex-col gap-1 border-r border-slate-800 bg-slate-950 p-4">
      <p className="mb-4 text-xl font-bold text-gold">BigGym</p>
      {NAV_ITEMS[role].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-gold text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
```

- [ ] **Step 2: Criar `src/components/layout/AppLayout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Sidebar } from './Sidebar'
import { Button } from '../common'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!currentUser) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar role={currentUser.role} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <span className="text-sm text-slate-400">{currentUser.email}</span>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/layout/index.ts`**

```typescript
export * from './Sidebar'
export * from './AppLayout'
```

- [ ] **Step 4: Verificar type-check**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout
git commit -m "feat: criar layout com sidebar por papel e topbar"
```

---

### Task 8: Login mockado, rotas protegidas e paginas placeholder

**Files:**
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/admin/AdminDashboardPage.tsx`
- Create: `src/features/professional/ProfessionalDashboardPage.tsx`
- Create: `src/features/subscriber/SubscriberDashboardPage.tsx`
- Create: `src/routes/ProtectedRoute.tsx`
- Create: `src/routes/AppRoutes.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (Task 5), `AppLayout` (Task 7), `Button`/`Input`/`Card` (Task 6), `initAllData` (Task 4).
- Produces: app navegavel com `/login`, `/admin`, `/profissional`, `/aluno` protegidas por papel.

- [ ] **Step 1: Criar `src/features/auth/LoginPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button, Card, Input } from '../../components/common'
import type { UserRole } from '../../types'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  professional: '/profissional',
  subscriber: '/aluno',
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const loginAsDemo = useAuthStore((state) => state.loginAsDemo)
  const currentUser = useAuthStore((state) => state.currentUser)
  const navigate = useNavigate()

  function goToDashboard(role: UserRole) {
    navigate(ROLE_HOME[role])
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const success = login(email, password)
    if (!success) {
      setError('E-mail ou senha invalidos.')
      return
    }
    setError('')
    if (currentUser) goToDashboard(currentUser.role)
  }

  function handleDemoLogin(role: UserRole) {
    const success = loginAsDemo(role)
    if (success) goToDashboard(role)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card title="Entrar no BigGym" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit">Entrar</Button>
        </form>
        <div className="mt-6 flex flex-col gap-2 border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400">Atalhos de demonstracao:</p>
          <Button variant="secondary" onClick={() => handleDemoLogin('admin')}>
            Entrar como Admin
          </Button>
          <Button variant="secondary" onClick={() => handleDemoLogin('professional')}>
            Entrar como Profissional
          </Button>
          <Button variant="secondary" onClick={() => handleDemoLogin('subscriber')}>
            Entrar como Aluno
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Criar `src/features/admin/AdminDashboardPage.tsx`**

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AdminDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Admin</h1>
      <Card>
        <p className="text-slate-300">Placeholder — receita do mes, inadimplencia, alunos ativos e aniversariantes entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 3: Criar `src/features/professional/ProfessionalDashboardPage.tsx`**

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function ProfessionalDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Profissional</h1>
      <Card>
        <p className="text-slate-300">Placeholder — lista de alunos vinculados, filtrada por tipo de atendimento, entra aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 4: Criar `src/features/subscriber/SubscriberDashboardPage.tsx`**

```tsx
import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function SubscriberDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Aluno</h1>
      <Card>
        <p className="text-slate-300">Placeholder — proximo pagamento, treino do dia e meta ativa entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
```

- [ ] **Step 5: Criar `src/routes/ProtectedRoute.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  professional: '/profissional',
  subscriber: '/aluno',
}

interface ProtectedRouteProps {
  allowedRole: UserRole
  children: ReactNode
}

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 6: Criar `src/routes/AppRoutes.tsx`**

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage'
import { ProfessionalDashboardPage } from '../features/professional/ProfessionalDashboardPage'
import { SubscriberDashboardPage } from '../features/subscriber/SubscriberDashboardPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
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
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 7: Atualizar `src/App.tsx`**

```tsx
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { initAllData } from './data'

function App() {
  useEffect(() => {
    initAllData()
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 8: Confirmar `src/main.tsx` (sem alteracao necessaria, so revisar import)**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9: Verificar type-check e build**

Run: `npm run typecheck`
Expected: sem erros.

Run: `npm run build`
Expected: build concluido sem erro.

- [ ] **Step 10: Verificar manualmente no navegador**

Run: `npm run dev` (deixar rodando)
Abrir `http://localhost:5173` e confirmar:
- Redireciona para `/login`.
- Clicar em "Entrar como Admin" leva a `/admin` com sidebar de Admin.
- Clicar em "Sair" volta para `/login`.
- Repetir para "Entrar como Profissional" (`/profissional`) e "Entrar como Aluno" (`/aluno`).
- Tentar acessar `/admin` logado como Aluno deve redirecionar para `/aluno`.

- [ ] **Step 11: Commit**

```bash
git add src/features src/routes src/App.tsx
git commit -m "feat: implementar login mockado e rotas protegidas por papel"
```

---

### Task 9: Guia de contribuicao para o grupo (`CONTRIBUTING.md`)

**Files:**
- Create: `CONTRIBUTING.md`

**Interfaces:**
- Produces: documento de referencia para os 4 colegas sem experiencia em desenvolvimento em equipe.

- [ ] **Step 1: Criar `CONTRIBUTING.md`**

```markdown
# Como contribuir no BigGym

Guia rapido para quem nunca trabalhou com Git em equipe. Siga esses passos sempre que for comecar uma tarefa.

## 1. Antes de comecar, atualize sua copia local

```bash
git checkout main
git pull origin main
```

## 2. Crie um branch para a sua tarefa

Nunca trabalhe direto no `main`. Crie um branch com esse padrao de nome:

```bash
git checkout -b feature/<area>-<descricao-curta>
```

Exemplos:
- `feature/admin-planos`
- `feature/profissional-treinos`
- `feature/aluno-evolucao`
- `feature/financial-pagamentos`

## 3. Trabalhe e comite em pequenos passos

```bash
git add <arquivos-que-voce-mudou>
git commit -m "feat: descricao curta do que foi feito"
```

Comite com frequencia (a cada pedaco que funciona), nao espere terminar tudo para comitar uma vez só.

## 4. Envie seu branch para o GitHub

```bash
git push origin feature/<area>-<descricao-curta>
```

## 5. Abra um Pull Request (PR)

No GitHub, vai aparecer um botao "Compare & pull request" depois do push. Clique nele, escreva o que voce fez e marque o responsavel pela revisao (quem integra o projeto) como revisor.

## 6. Aguarde a revisao

Quem revisar pode pedir ajustes nos comentarios do PR. Faca as mudancas no mesmo branch, comite e empurre de novo (`git push`) — o PR atualiza automaticamente, nao precisa abrir um novo.

## 7. Depois do merge

Quando o PR for aprovado e "mergeado" no `main`, volte ao passo 1 para a proxima tarefa.

## Regras importantes

- **Nunca** use `git push --force` ou `git push origin main` direto.
- Cada feature so pode importar de `types`, `data`, `store`, `components` e `utils` — nunca de outra feature (ex: a feature `admin` nao importa nada de dentro de `features/subscriber`).
- Se precisar de algo que esta em outra feature, avise quem revisa o projeto antes de duplicar codigo.
- Nomes de arquivos, tipos e variaveis em ingles. Textos de tela, rotas e commits em portugues.
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: adicionar guia de contribuicao com fluxo de branch e PR"
```

---

### Task 10: Integracao final e push

**Files:**
- Nenhum arquivo novo — verificacao e envio do estado atual.

- [ ] **Step 1: Rodar verificacao completa**

Run: `npm run typecheck && npm run build`
Expected: ambos terminam sem erro.

- [ ] **Step 2: Confirmar estrutura final de pastas**

Run: `find src -type f | sort`
Expected: lista contendo todos os arquivos criados nas Tasks 1 a 8 (types, data, store, components, features, routes), sem pastas `aluno`/`profissional` remanescentes.

- [ ] **Step 3: Push de todos os commits**

```bash
git push origin main
```

- [ ] **Step 4: Lembrete manual (fora do Git) — proteger o branch main**

No GitHub, em `Settings > Branches` do repositorio `AbnerLevino/GymSystem`, cadastrar uma regra de protecao para `main` exigindo Pull Request antes de merge. Esse passo é feito na interface do GitHub pelo dono do repositorio (Abner), nao via linha de comando.
```

---

## Self-Review

**Spec coverage:**
- Stack (Vite, Tailwind, Router, Zustand, localStorage) → Task 1.
- Modelo de dados em ingles (seção 4 do spec, traduzido) → Task 3.
- Persistência mockada em localStorage com seed → Task 4.
- Login mockado com atalhos de demonstração + autenticação por papel → Task 5 e Task 8.
- Roteamento protegido por papel com redirecionamento → Task 8.
- Componentes criados do zero (não lib pronta) → Task 6 e Task 7.
- Estrutura plugável por feature (admin/professional/subscriber/financial) sem acoplamento → Task 2 e Global Constraints.
- Fluxo de Git para equipe inexperiente → Task 9.
- Recharts e jsPDF (gráfico de evolução, recibo PDF) ficam fora deste plano — pertencem às features `subscriber`/`financial` que cada colega implementa depois, não ao esqueleto compartilhado.

**Placeholder scan:** nenhum "TBD"/"implementar depois" — todo código é completo e funcional, incluindo as páginas de dashboard que são explicitamente placeholders de conteúdo (mas com código real, sem lacunas).

**Type consistency:** `UserRole` usado identicamente em `types/user.ts`, `store/authStore.ts`, `routes/ProtectedRoute.tsx`, `components/layout/Sidebar.tsx` e `features/auth/LoginPage.tsx`. Nomes de função (`findUserByCredentials`, `findDemoUserByRole`, `initAllData`) consistentes entre Task 4 (onde são definidos) e Tasks 5/8 (onde são consumidos).
