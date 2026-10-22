# Pagamento no Cadastro Presencial — Plano de Implementação

> **Para quem for executar:** siga `npm run typecheck` como ciclo de verificação
> (este projeto não tem suíte automatizada — ver convenção já registrada em
> `docs/superpowers/plans/2026-10-19-atendente-fase-a.md`). Depois de cada Task, confira
> visualmente no navegador antes de commitar.

**Objetivo:** dar ao papel Atendente uma etapa real de cobrança (Pix com QR Code,
cartão com formulário mascarado, dinheiro) dentro do fluxo de cadastro presencial —
antes da captura de rosto — gerando o primeiro `Pagamento` do aluno e um recibo em PDF.
O motor (`pagamentoService.ts`) e a tela de checkout (`PagamentoCheckout.tsx`) são
construídos para serem reaproveitados depois pela cobrança de mensalidade recorrente
(`/atendente/pagamento/:alunoId`, prevista na Fase A como Task 9, ainda não
implementada).

**Arquitetura:** `types` (já existe, `Pagamento`/`MetodoPagamento`) → `data/
pagamentoRepository.ts` (I/O no `localStorage`, ganha `salvarPagamento`) → `data/
pagamentoService.ts` (regra de negócio: simular aprovação, calcular recibo, nunca
persiste dado de cartão) → `features/attendant/PagamentoCheckout.tsx` (UI de checkout,
reutilizável dentro da feature) → `features/attendant/AttendantCadastroPage.tsx` (usa o
checkout como uma etapa do fluxo).

**Tech Stack:** React + TypeScript + Tailwind (já no projeto). Nova dependência:
`qrcode` (gera a imagem do QR Code do Pix no navegador, sem backend).

## Global Constraints

- Nomes de campo/tipo em inglês, textos de tela em português (convenção já registrada
  na Fase A).
- Uma feature nunca importa de outra feature (`CONTRIBUTING.md`). `PagamentoCheckout.tsx`
  mora em `features/attendant/` e só pode ser importado por outros arquivos dentro de
  `features/attendant/`.
- Dado de cartão (número, validade, CVV) nunca é persistido em `localStorage` nem em
  nenhum `Repository` — fica só no estado React do componente de checkout e é
  descartado depois do envio.
- Chave Pix fake fixa: `academia@biggym.com`. Código do QR Code sempre prefixado com
  `PIX-SIMULADO-` para nunca parecer um payload Pix real (EMV) sacável.

---

### Task 1: Máscaras de cartão (`mascaras.ts`)

**Files:**
- Modify: `src/utils/mascaras.ts`

**Interfaces:**
- Produces: `formatarNumeroCartao(valor: string): string`,
  `formatarValidadeCartao(valor: string): string` — usados pela Task 4
  (`PagamentoCheckout.tsx`).

- [ ] **Step 1: Adicionar as duas funções no final do arquivo**

```ts
export function formatarNumeroCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 16)
  return digitos.replace(/(.{4})/g, '$1 ').trim()
}

export function formatarValidadeCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS (funções novas, nada mais mudou).

- [ ] **Step 3: Commit**

```bash
git add src/utils/mascaras.ts
git commit -m "feat: adicionar mascaras de numero e validade de cartao"
```

---

### Task 2: Escrita no repository de pagamento

**Files:**
- Modify: `src/data/pagamentoRepository.ts`

**Interfaces:**
- Produces: `salvarPagamento(pagamento: Pagamento): void` — cria se o `id` não existir,
  atualiza se existir (mesmo padrão de `salvarAluno` em `alunoRepository.ts`). Usado
  pela Task 3 (`pagamentoService.ts`) e pela Task 5 (`AttendantCadastroPage.tsx`).

- [ ] **Step 1: Substituir o conteúdo do arquivo**

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

export function salvarPagamento(pagamento: Pagamento): void {
  const current = obterPagamentos()
  const index = current.findIndex((item) => item.id === pagamento.id)
  if (index === -1) {
    writeCollection(KEY, [...current, pagamento])
  } else {
    const updated = [...current]
    updated[index] = pagamento
    writeCollection(KEY, updated)
  }
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/data/pagamentoRepository.ts
git commit -m "feat: adicionar escrita (upsert) ao repository de pagamento"
```

---

### Task 3: Motor de pagamento (`pagamentoService.ts`)

**Files:**
- Modify: `package.json` (nova dependência `qrcode`, dev dependency `@types/qrcode`)
- Create: `src/data/pagamentoService.ts`

**Interfaces:**
- Consumes: `obterPagamentos(): Pagamento[]`, `salvarPagamento(pagamento: Pagamento):
  void` (Task 2).
- Produces: `processarPagamento(pagamento: Pagamento, paymentMethod: MetodoPagamento):
  Promise<{ aprovado: boolean; pagamentoAtualizado: Pagamento }>`,
  `gerarReciboPDF(pagamento: Pagamento, nomeAluno: string): void` — usados pela Task 4
  (`PagamentoCheckout.tsx`).

- [ ] **Step 1: Instalar as dependências**

Run: `npm install qrcode && npm install -D @types/qrcode`
Expected: `package.json` ganha `"qrcode"` em `dependencies` e `"@types/qrcode"` em
`devDependencies`.

- [ ] **Step 2: Criar o motor**

Create `src/data/pagamentoService.ts`:

```ts
import jsPDF from 'jspdf'
import type { MetodoPagamento, Pagamento } from '../types'
import { obterPagamentos, salvarPagamento } from './pagamentoRepository'

const DELAY_SIMULADO_MS = 1200
const CHANCE_DE_RECUSA = 0.1

function proximoNumeroRecibo(): string {
  const pagamentos = obterPagamentos()
  const quantidadeComRecibo = pagamentos.filter((pagamento) => pagamento.receiptNumber).length
  return `REC-${String(quantidadeComRecibo + 1).padStart(4, '0')}`
}

export interface ResultadoProcessamento {
  aprovado: boolean
  pagamentoAtualizado: Pagamento
}

// Simulação: sempre tem um delay (parece processamento real) e recusa ~10% das vezes
// pra existir caminho de erro pra tratar na tela. Nenhuma integração real de pagamento
// — é aqui, e só aqui, que entraria uma chamada a um gateway real no futuro.
export async function processarPagamento(
  pagamento: Pagamento,
  paymentMethod: MetodoPagamento,
): Promise<ResultadoProcessamento> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_SIMULADO_MS))

  const aprovado = Math.random() > CHANCE_DE_RECUSA

  if (!aprovado) {
    return { aprovado: false, pagamentoAtualizado: pagamento }
  }

  const pagamentoAtualizado: Pagamento = {
    ...pagamento,
    paidValue: pagamento.originalValue,
    paymentMethod,
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    receiptNumber: proximoNumeroRecibo(),
  }

  salvarPagamento(pagamentoAtualizado)

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
```

- [ ] **Step 3: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/data/pagamentoService.ts
git commit -m "feat: criar motor de pagamento simulado com recibo em pdf"
```

---

### Task 4: Tela de checkout reutilizável (`PagamentoCheckout.tsx`)

**Files:**
- Create: `src/features/attendant/PagamentoCheckout.tsx`

**Interfaces:**
- Consumes: `processarPagamento`, `gerarReciboPDF` (Task 3);
  `formatarNumeroCartao`, `formatarValidadeCartao` (Task 1); `PAISES_DDI` não é usado
  aqui (é só do telefone).
- Produces: componente `<PagamentoCheckout pagamento={pagamento} nomeAluno={nome}
  onAprovado={(pagamentoAtualizado) => void} />` — usado pela Task 5
  (`AttendantCadastroPage.tsx`) e, depois, pela cobrança de mensalidade recorrente
  (Task 9 da Fase A, ainda não implementada).

- [ ] **Step 1: Criar o componente**

Create `src/features/attendant/PagamentoCheckout.tsx`:

```tsx
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Button, Card } from '../../components/common'
import { processarPagamento, gerarReciboPDF } from '../../data/pagamentoService'
import { formatarNumeroCartao, formatarValidadeCartao } from '../../utils/mascaras'
import type { MetodoPagamento, Pagamento } from '../../types'

const CHAVE_PIX_FAKE = 'academia@biggym.com'

interface PagamentoCheckoutProps {
  pagamento: Pagamento
  nomeAluno: string
  onAprovado: (pagamentoAtualizado: Pagamento) => void
}

const METODOS: { id: MetodoPagamento; label: string }[] = [
  { id: 'pix', label: 'Pix' },
  { id: 'creditCard', label: 'Cartao de credito' },
  { id: 'debitCard', label: 'Cartao de debito' },
  { id: 'cash', label: 'Dinheiro' },
]

// Dado de cartao (numero/validade/cvv) fica só neste estado local e nunca é
// persistido em nenhum repository — some quando o componente desmonta.
export function PagamentoCheckout({ pagamento, nomeAluno, onAprovado }: PagamentoCheckoutProps) {
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null)
  const [numeroCartao, setNumeroCartao] = useState('')
  const [validadeCartao, setValidadeCartao] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  const codigoPixSimulado = `PIX-SIMULADO-${pagamento.id}-${pagamento.originalValue.toFixed(2)}`

  useEffect(() => {
    if (metodo !== 'pix') return
    QRCode.toDataURL(codigoPixSimulado).then(setQrCodeUrl)
  }, [metodo, codigoPixSimulado])

  async function handleConfirmar() {
    if (!metodo) return
    setErro('')
    setProcessando(true)
    const { aprovado, pagamentoAtualizado } = await processarPagamento(pagamento, metodo)
    setProcessando(false)

    if (!aprovado) {
      setErro('Pagamento recusado. Tente novamente ou escolha outro metodo.')
      return
    }

    gerarReciboPDF(pagamentoAtualizado, nomeAluno)
    onAprovado(pagamentoAtualizado)
  }

  function handleCopiarCodigoPix() {
    navigator.clipboard.writeText(codigoPixSimulado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const cartaoValido =
    numeroCartao.replace(/\D/g, '').length === 16 && validadeCartao.length === 5 && cvv.length >= 3 && nomeCartao.trim().length > 0

  return (
    <Card title="Pagamento">
      <p className="text-sm text-slate-600">
        Primeira cobranca de {nomeAluno} — R$ {pagamento.originalValue.toFixed(2)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METODOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMetodo(item.id)
              setErro('')
            }}
            className={`rounded-md border-2 p-3 text-sm font-medium transition-colors ${
              metodo === item.id ? 'border-rose-800 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {metodo === 'pix' ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-md border border-slate-200 p-4">
          {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code Pix" className="h-40 w-40" /> : null}
          <p className="text-xs text-slate-500">Chave Pix: {CHAVE_PIX_FAKE}</p>
          <Button type="button" variant="secondary" onClick={handleCopiarCodigoPix}>
            {copiado ? 'Codigo copiado!' : 'Copiar codigo Pix'}
          </Button>
        </div>
      ) : null}

      {metodo === 'creditCard' || metodo === 'debitCard' ? (
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Numero do cartao
            <input
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(formatarNumeroCartao(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Nome impresso no cartao
            <input
              value={nomeCartao}
              onChange={(e) => setNomeCartao(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1 text-sm font-medium text-slate-700">
              Validade
              <input
                value={validadeCartao}
                onChange={(e) => setValidadeCartao(formatarValidadeCartao(e.target.value))}
                placeholder="MM/AA"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
              />
            </label>
            <label className="block flex-1 text-sm font-medium text-slate-700">
              CVV
              <input
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="000"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
              />
            </label>
          </div>
        </div>
      ) : null}

      {metodo === 'cash' ? (
        <div className="mt-4 rounded-md border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Confirme que recebeu o valor em dinheiro no balcao.</p>
        </div>
      ) : null}

      {erro ? <p className="mt-3 text-sm text-red-600">{erro}</p> : null}

      {metodo ? (
        <Button
          type="button"
          className="mt-4"
          disabled={processando || ((metodo === 'creditCard' || metodo === 'debitCard') && !cartaoValido)}
          onClick={handleConfirmar}
        >
          {processando ? 'Processando...' : 'Confirmar pagamento'}
        </Button>
      ) : null}
    </Card>
  )
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/attendant/PagamentoCheckout.tsx
git commit -m "feat: criar tela de checkout reutilizavel (pix, cartao, dinheiro)"
```

---

### Task 5: Ligar a etapa "Pagamento" ao fluxo de cadastro

**Files:**
- Modify: `src/features/attendant/AttendantCadastroPage.tsx`

**Interfaces:**
- Consumes: `<PagamentoCheckout>` (Task 4).

- [ ] **Step 1: Adicionar `'pagamento'` ao tipo `Etapa` e aos `PASSOS`**

```ts
type Etapa = 'formulario' | 'pagamento' | 'captura' | 'sucesso'

const PASSOS: { etapa: Etapa; label: string }[] = [
  { etapa: 'formulario', label: 'Dados' },
  { etapa: 'pagamento', label: 'Pagamento' },
  { etapa: 'captura', label: 'Rosto' },
  { etapa: 'sucesso', label: 'Confirmacao' },
]
```

- [ ] **Step 2: Importar o tipo `Pagamento` e o componente novo**

```tsx
import type { Aluno, Pagamento, Usuario } from '../../types'
import { PagamentoCheckout } from './PagamentoCheckout'
```

- [ ] **Step 3: Gerar o `alunoId` e o `Pagamento` pendente antes de entrar na etapa**

No topo do componente, logo depois dos outros `useState`:

```ts
const [alunoId] = useState(() => crypto.randomUUID())
const [pagamentoPendente, setPagamentoPendente] = useState<Pagamento | null>(null)
```

- [ ] **Step 4: Atualizar `handleSubmitFormulario` pra criar o pagamento e decidir a próxima etapa**

Substitua o corpo da função:

```ts
function handleSubmitFormulario(event: React.FormEvent) {
  event.preventDefault()

  if (!visitaTeste) {
    if (!planoAtualId) {
      setErro('Escolha um plano antes de matricular, ou marque "Visita teste".')
      return
    }
    if (buscarUsuarioPorEmail(email)) {
      setErro('E-mail ja cadastrado.')
      return
    }

    const planoSelecionado = planos.find((plano) => plano.id === planoAtualId)
    if (!planoSelecionado) return

    setPagamentoPendente({
      id: crypto.randomUUID(),
      academiaId: 'gym-1',
      alunoId,
      planoId: planoSelecionado.id,
      originalValue: planoSelecionado.price,
      paidValue: null,
      lateFee: 0,
      paymentMethod: null,
      dueDate: new Date().toISOString().slice(0, 10),
      paymentDate: null,
      status: 'pending',
      receiptNumber: null,
    })

    setErro('')
    setEtapa('pagamento')
    return
  }

  setErro('')
  setEtapa('captura')
}
```

- [ ] **Step 5: Usar o `alunoId` já gerado em `handleCapturar` (em vez de criar outro)**

Troque a primeira linha da função (remova `const alunoId = crypto.randomUUID()` e use o
`alunoId` do estado):

```ts
function handleCapturar(captura: { descriptor: number[]; photoUrl: string } | null) {
  if (!captura) {
    setErro('Nenhum rosto detectado. Tente novamente com boa iluminacao.')
    return
  }

  const aluno: Aluno = {
    id: alunoId,
    fullName,
    weight: 0,
    height: 0,
    phone: `${ddi} ${phone}`,
    cpf,
    address,
    birthDate,
    notes: '',
    planoAtualId: visitaTeste ? null : planoAtualId,
    startDate: new Date().toISOString().slice(0, 10),
    status: visitaTeste ? 'trial' : 'active',
    faceDescriptor: captura.descriptor,
    photoUrl: captura.photoUrl,
  }
  salvarAluno(aluno)

  if (!visitaTeste) {
    const usuario: Usuario = {
      id: crypto.randomUUID(),
      email,
      password,
      role: 'subscriber',
      refId: alunoId,
    }
    salvarUsuario(usuario)
  }

  setErro('')
  setEtapa('sucesso')
}
```

- [ ] **Step 6: Renderizar a etapa "Pagamento" no JSX**

Adicione este bloco entre o `</form>` (fim da etapa `'formulario'`) e o bloco
`{etapa === 'captura' ? (`:

```tsx
{etapa === 'pagamento' && pagamentoPendente ? (
  <div className="mx-auto mt-6 max-w-xl">
    <PagamentoCheckout
      pagamento={pagamentoPendente}
      nomeAluno={fullName}
      onAprovado={() => setEtapa('captura')}
    />
  </div>
) : null}
```

- [ ] **Step 7: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Verificar no navegador**

Run: `npm run dev`. Entre como Atendente → "Cadastrar aluno" → preencha os dados sem
marcar "Visita teste", escolha um plano, envie. Expected: cai na etapa "Pagamento",
escolha "Pix" (aparece QR Code + chave `academia@biggym.com` + botao copiar), ou
"Cartao de credito" (preencha os 4 campos — o botao "Confirmar pagamento" só habilita
com os 16 digitos do cartao, validade `MM/AA` e CVV preenchidos). Clique em "Confirmar
pagamento": depois de ~1.2s, ou avança pra etapa "Rosto" com um PDF `REC-00XX.pdf`
baixado, ou mostra "Pagamento recusado" (≈10% das vezes — tente de novo). Marque
"Visita teste" num novo cadastro e confirme que a etapa "Pagamento" é pulada.

- [ ] **Step 9: Commit**

```bash
git add src/features/attendant/AttendantCadastroPage.tsx
git commit -m "feat: adicionar etapa de pagamento ao cadastro presencial do atendente"
```

---

## Depois deste plano

Com `PagamentoCheckout.tsx` e `pagamentoService.ts` prontos, a Task 9 da Fase A
(cobrança de mensalidade recorrente em `/atendente/pagamento/:alunoId`) fica reduzida a:
buscar o `Pagamento` pendente do aluno e renderizar `<PagamentoCheckout pagamento={...}
nomeAluno={...} onAprovado={...} />` — sem reescrever nenhuma lógica de checkout.
