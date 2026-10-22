# Migração de paleta Emerald — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a cor de marca do sistema (`rose-800`/`rose-700`/variações) por
**Emerald** (`emerald-700` como base), em todos os arquivos que hoje usam `rose-*`, sem
alterar layout, espaçamento ou a cor semântica de perigo (`red-600`, intocada).

**Architecture:** É uma troca mecânica de classes Tailwind (tokens de cor), arquivo por
arquivo. Não há lógica nova, não há componentes novos. A ordem segue de componentes
reutilizáveis (`Button`, `Input`, `SeletorDdi`) para os arquivos de feature que os
consomem, terminando pela landing page pública (`HomePage`/`MatriculaPage`), que tem um
contraste maior de tons de rose (950/600/500) por ser um hero mais escuro.

**Tech Stack:** React + TypeScript + Tailwind CSS (v3, classes utilitárias, sem CSS-in-JS).

## Global Constraints

- Projeto não tem suíte de testes automatizados (`package.json` só define `dev`, `build`,
  `preview`, `typecheck`) — a verificação de cada task é `npm run typecheck` + inspeção
  visual, não testes unitários.
- Não trocar `red-600`/`red-*` em nenhum arquivo — é a cor de perigo/cancelamento, fora de
  escopo (ver spec `docs/superpowers/specs/2026-10-22-paleta-emerald-design.md`).
- Não trocar `slate-*`/`zinc-*` (neutros) nem `emerald` usado como indicador semântico de
  sucesso já existente (ex: bolinha verde de sessão ativa) — já está correto.
- Mapeamento de tom a aplicar em todo o plano:
  - `rose-950` → `emerald-950`
  - `rose-900` → `emerald-800`
  - `rose-800` → `emerald-700`
  - `rose-700` → `emerald-700`
  - `rose-600` → `emerald-600`
  - `rose-500` → `emerald-500`
  - `rose-50` → `emerald-50`
  - `#FDECEF` (fundo de item ativo) → `#E7F6EF`
  - `accent-rose-800` → `accent-emerald-700`
  - `ring-rose-800/30` → `ring-emerald-700/30`
  - `border-rose-800/30` → `border-emerald-700/30`

---

### Task 1: `Button.tsx` — variant `primary`

**Files:**
- Modify: `src/components/common/Button.tsx:10`

**Interfaces:**
- Consumes: nada (componente folha).
- Produces: nenhuma mudança de assinatura — só a classe CSS do variant `primary` muda de
  cor. Qualquer arquivo que usa `<Button variant="primary">` (comportamento padrão) herda
  o novo tom automaticamente, sem precisar editar esses call sites.

- [ ] **Step 1: Trocar a cor do variant `primary`**

Em `src/components/common/Button.tsx`, linha 10, trocar:

```tsx
  primary: 'bg-rose-800 text-white hover:bg-rose-900',
```

por:

```tsx
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800',
```

(`danger: 'bg-red-600 text-white hover:bg-red-700'` na linha 12 **não muda**.)

- [ ] **Step 2: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros (mudança é só de string de classe, não afeta tipos).

- [ ] **Step 3: Commit**

```bash
git add src/components/common/Button.tsx
git commit -m "feat: migra botao primario para paleta emerald"
```

---

### Task 2: `Input.tsx` e `SeletorDdi.tsx` — foco e item selecionado

**Files:**
- Modify: `src/components/common/Input.tsx:13`
- Modify: `src/components/common/SeletorDdi.tsx:32`, `SeletorDdi.tsx:50`

**Interfaces:**
- Consumes: nada (componentes folha).
- Produces: nenhuma mudança de assinatura.

- [ ] **Step 1: `Input.tsx` — borda e ring de foco**

Em `src/components/common/Input.tsx`, linha 13, trocar:

```tsx
        className={`mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30 ${className ?? ''}`}
```

por:

```tsx
        className={`mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 ${className ?? ''}`}
```

- [ ] **Step 2: `SeletorDdi.tsx` — botão do dropdown (linha 32)**

Trocar:

```tsx
        className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
```

por:

```tsx
        className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
```

- [ ] **Step 3: `SeletorDdi.tsx` — item selecionado na lista (linha 50)**

Trocar:

```tsx
                  pais.ddi === value ? 'bg-rose-50 text-rose-800' : 'text-slate-700'
```

por:

```tsx
                  pais.ddi === value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
```

- [ ] **Step 4: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/Input.tsx src/components/common/SeletorDdi.tsx
git commit -m "feat: migra foco de inputs e seletor de ddi para emerald"
```

---

### Task 3: `Sidebar.tsx` — logo, item ativo, hover, avatar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:87`, `:112-113`, `:139`, `:158`

**Interfaces:**
- Consumes: nada além do que já importa.
- Produces: nenhuma mudança de assinatura.

- [ ] **Step 1: Logo (máscara CSS), linha 87**

Trocar:

```tsx
          className="h-11 w-28 bg-rose-700"
```

por:

```tsx
          className="h-11 w-28 bg-emerald-700"
```

- [ ] **Step 2: Item ativo e hover do nav, linhas 112-113**

Trocar:

```tsx
                  isActive
                    ? 'bg-[#FDECEF] text-rose-700'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-rose-700'
```

por:

```tsx
                  isActive
                    ? 'bg-[#E7F6EF] text-emerald-700'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-emerald-700'
```

- [ ] **Step 3: Avatar com iniciais (sem foto), linha 139**

Trocar:

```tsx
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-base font-semibold text-rose-700">
```

por:

```tsx
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-base font-semibold text-emerald-700">
```

- [ ] **Step 4: Hover do botão "Sair", linha 158**

Trocar:

```tsx
            transition-colors hover:bg-zinc-50 hover:text-rose-700"
```

por:

```tsx
            transition-colors hover:bg-zinc-50 hover:text-emerald-700"
```

- [ ] **Step 5: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: migra sidebar para paleta emerald"
```

---

### Task 4: `PagamentoCheckout.tsx` — seleção de método e inputs

**Files:**
- Modify: `src/components/payment/PagamentoCheckout.tsx:91`, `:142`, `:169`, `:182`, `:192`, `:201`

**Interfaces:**
- Consumes: nada além do que já importa.
- Produces: nenhuma mudança de assinatura.

- [ ] **Step 1: Spinner de carregamento, linha 91**

Trocar:

```tsx
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-rose-800" />
```

por:

```tsx
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />
```

- [ ] **Step 2: Card de método de pagamento selecionado, linha 142**

Trocar:

```tsx
              metodo === item.id ? 'border-rose-800 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-700 hover:border-slate-300'
```

por:

```tsx
              metodo === item.id ? 'border-emerald-700 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'
```

- [ ] **Step 3: Inputs de foco (linhas 169, 182, 192, 201 — mesmo padrão nas quatro)**

Em cada uma das quatro linhas, trocar:

```tsx
focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30
```

por:

```tsx
focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30
```

(o restante de cada className permanece igual — só essa substring muda, nas 4 ocorrências.)

- [ ] **Step 4: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/payment/PagamentoCheckout.tsx
git commit -m "feat: migra checkout de pagamento para emerald"
```

---

### Task 5: `AttendantCadastroPage.tsx` e `FaceIdPreview.tsx`

**Files:**
- Modify: `src/features/attendant/AttendantCadastroPage.tsx:35`, `:37`, `:45`, `:179`, `:201`, `:250`, `:254`, `:259`
- Modify: `src/features/attendant/FaceIdPreview.tsx:81`, `:89`

**Interfaces:**
- Consumes: nada além do que já importa.
- Produces: nenhuma mudança de assinatura.

- [ ] **Step 1: `AttendantCadastroPage.tsx` — indicador de etapa do wizard, linhas 35-37**

Trocar:

```tsx
                    ? 'bg-rose-800 text-white'
```

por:

```tsx
                    ? 'bg-emerald-700 text-white'
```

e trocar:

```tsx
                      ? 'border-2 border-rose-800 text-rose-800'
```

por:

```tsx
                      ? 'border-2 border-emerald-700 text-emerald-700'
```

- [ ] **Step 2: Label da etapa ativa, linha 45**

Trocar:

```tsx
                  ativo ? 'text-rose-800' : concluido ? 'text-slate-600' : 'text-slate-400'
```

por:

```tsx
                  ativo ? 'text-emerald-700' : concluido ? 'text-slate-600' : 'text-slate-400'
```

- [ ] **Step 3: Checkbox, linha 179**

Trocar:

```tsx
              className="h-4 w-4 accent-rose-800"
```

por:

```tsx
              className="h-4 w-4 accent-emerald-700"
```

- [ ] **Step 4: Input de foco, linha 201**

Trocar:

```tsx
                    className="block h-10 w-full rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
```

por:

```tsx
                    className="block h-10 w-full rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
```

- [ ] **Step 5: Card de plano selecionado, linhas 250, 254, 259**

Trocar:

```tsx
                          selecionado ? 'border-rose-800 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
```

por:

```tsx
                          selecionado ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
```

Trocar:

```tsx
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-800 text-white">
```

por:

```tsx
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
```

Trocar:

```tsx
                          <p className="mt-1 text-2xl font-bold text-rose-800">R$ {plano.price.toFixed(2)}</p>
```

por:

```tsx
                          <p className="mt-1 text-2xl font-bold text-emerald-700">R$ {plano.price.toFixed(2)}</p>
```

- [ ] **Step 6: `FaceIdPreview.tsx` — moldura e botão, linhas 81 e 89**

Trocar:

```tsx
        className="aspect-square w-full rounded-full border-4 border-rose-800/30 object-cover"
```

por:

```tsx
        className="aspect-square w-full rounded-full border-4 border-emerald-700/30 object-cover"
```

Trocar:

```tsx
        className="inline-flex items-center justify-center rounded-md bg-rose-800 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-50"
```

por:

```tsx
        className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
```

- [ ] **Step 7: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add src/features/attendant/AttendantCadastroPage.tsx src/features/attendant/FaceIdPreview.tsx
git commit -m "feat: migra cadastro de aluno e preview de face id para emerald"
```

---

### Task 6: `HomePage.tsx` e `MatriculaPage.tsx` — landing pública

**Files:**
- Modify: `src/features/home/HomePage.tsx:86`, `:96`, `:137`, `:167`, `:180`, `:195`
- Modify: `src/features/home/MatriculaPage.tsx:95`

**Interfaces:**
- Consumes: nada além do que já importa.
- Produces: nenhuma mudança de assinatura.

- [ ] **Step 1: `HomePage.tsx` — painel escuro do hero, linha 86**

Trocar:

```tsx
        <div className="absolute inset-y-0 left-0 z-[1] flex w-1/2 items-center overflow-hidden rounded-r-[4rem] bg-rose-950">
```

por:

```tsx
        <div className="absolute inset-y-0 left-0 z-[1] flex w-1/2 items-center overflow-hidden rounded-r-[4rem] bg-emerald-950">
```

- [ ] **Step 2: Botão principal do hero, linha 96**

Trocar:

```tsx
              className="group relative inline-flex h-12 w-52 flex-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-rose-600 font-sans text-sm font-semibold text-white transition-colors hover:bg-rose-500"
```

por:

```tsx
              className="group relative inline-flex h-12 w-52 flex-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-emerald-600 font-sans text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
```

- [ ] **Step 3: Input de busca, linha 137**

Trocar:

```tsx
              className="h-12 w-full rounded-full border-2 border-white bg-slate-800/90 py-0 pl-10 pr-4 font-sans text-sm font-normal text-white placeholder-slate-400 placeholder:text-sm hover:border-rose-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
```

por:

```tsx
              className="h-12 w-full rounded-full border-2 border-white bg-slate-800/90 py-0 pl-10 pr-4 font-sans text-sm font-normal text-white placeholder-slate-400 placeholder:text-sm hover:border-emerald-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
```

- [ ] **Step 4: Setas/links de navegação do carrossel, linhas 167 e 195 (mesmo padrão nas duas)**

Em cada uma das duas linhas, trocar:

```tsx
                    className="flex-none text-white hover:text-rose-500"
```

por:

```tsx
                    className="flex-none text-white hover:text-emerald-500"
```

- [ ] **Step 5: Card de item do carrossel, linha 180**

Trocar:

```tsx
                      className="flex flex-1 flex-col items-start rounded-xl border-2 border-white bg-stone-50 px-10 pb-11 pt-2 text-left text-slate-900 hover:border-rose-500"
```

por:

```tsx
                      className="flex flex-1 flex-col items-start rounded-xl border-2 border-white bg-stone-50 px-10 pb-11 pt-2 text-left text-slate-900 hover:border-emerald-500"
```

- [ ] **Step 6: `MatriculaPage.tsx` — card de plano selecionado, linha 95**

Trocar:

```tsx
                planoAtualId === plano.id ? 'border-rose-800 ring-2 ring-rose-800/30' : 'border-slate-300'
```

por:

```tsx
                planoAtualId === plano.id ? 'border-emerald-700 ring-2 ring-emerald-700/30' : 'border-slate-300'
```

- [ ] **Step 7: Rodar typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add src/features/home/HomePage.tsx src/features/home/MatriculaPage.tsx
git commit -m "feat: migra landing page e matricula publica para emerald"
```

---

### Task 7: Verificação final

**Files:** nenhum (só leitura/verificação).

- [ ] **Step 1: Conferir que não sobrou nenhum `rose-*` fora de escopo**

Run: `grep -rn "rose-" src --include="*.tsx"`
Expected: nenhum resultado (0 ocorrências). Se aparecer algo, é um arquivo que ficou de
fora do levantamento original — tratar como task extra antes de prosseguir.

- [ ] **Step 2: Conferir que `red-600` (perigo) não foi tocado**

Run: `grep -rn "red-600" src/components/common/Button.tsx`
Expected: a linha `danger: 'bg-red-600 text-white hover:bg-red-700',` continua presente,
inalterada.

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: build conclui sem erros (confirma que não há classes com sintaxe quebrada e que
o TypeScript compila limpo).

- [ ] **Step 4: Checagem visual**

Com `npm run dev` rodando, abrir `http://localhost:5173/login`, entrar como atendente e
conferir visualmente: logo do sidebar em verde, item de menu ativo com fundo
`#E7F6EF`/texto verde, botões primários (`Button variant="primary"`) em `emerald-700`,
inputs com ring de foco verde ao clicar. Conferir também a landing pública (`/`) e a tela
de matrícula (`/matricula`).

- [ ] **Step 5: Commit final (se a Step 1 encontrou ajustes)**

Só necessário se a Step 1 revelou arquivos fora do levantamento original e eles foram
corrigidos nesta task:

```bash
git add -A
git commit -m "fix: ajustes finais da migracao de paleta emerald"
```
