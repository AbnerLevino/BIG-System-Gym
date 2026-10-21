# Comprovante de Pagamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar o PDF automático de pagamento por uma tela de comprovante estilo
app de pagamento (Nubank), exibida dentro da própria etapa "Pagamento" do cadastro
presencial do Atendente, antes de avançar pro FaceID — com um PDF agora opcional via
botão.

**Architecture:** `PagamentoCheckout` (seleção de método + chamada ao motor de
pagamento) sai de `features/attendant/` para `components/pagamento/`, ganha uma
máquina de estados interna (`selecionando → processando → check → aprovado`) e, no
estado `aprovado`, renderiza um novo componente puramente visual,
`ComprovantePagamento`. Ambos moram em `components/` porque vão ser reusados pela
futura feature do Aluno pagando sozinho (fora de escopo deste plano) — uma feature
nunca pode importar de outra feature neste projeto.

**Tech Stack:** React + TypeScript + Tailwind (já no projeto). Sem dependências novas.

## Global Constraints

- Nomes de campo/tipo em inglês, textos de tela em português (convenção já registrada
  na Fase A).
- Uma feature nunca importa de outra feature (`CONTRIBUTING.md`). Por isso
  `PagamentoCheckout` e `ComprovantePagamento` vão para `src/components/pagamento/`,
  não para dentro de `features/attendant/`.
- Dado de cartão (número, validade, CVV) nunca é persistido em `localStorage` nem em
  nenhum `Repository` — fica só no estado React e é descartado quando o componente
  desmonta. Só derivados (bandeira, últimos 4 dígitos) chegam no comprovante.
- Não existe suíte automatizada neste projeto — o ciclo de verificação é
  `npm run typecheck` + checagem visual no navegador (convenção já registrada em
  `docs/superpowers/plans/2026-10-19-atendente-fase-a.md` e
  `docs/superpowers/plans/2026-10-20-pagamento-cadastro.md`).
- Não se chama mais de "recibo" em nenhum texto de tela, nome de PDF ou prefixo — é
  "comprovante" em todo lugar.

---

### Task 1: Detectar bandeira do cartão

**Files:**
- Modify: `src/utils/mascaras.ts`

**Interfaces:**
- Produces: `detectarBandeiraCartao(numero: string): string` — usado pela Task 5
  (`PagamentoCheckout.tsx`) pra derivar a bandeira a partir do número digitado, sem
  nunca persistir o número completo.

- [ ] **Step 1: Adicionar a função no final do arquivo**

```ts
export function detectarBandeiraCartao(numero: string): string {
  const digitos = numero.replace(/\D/g, '')
  if (digitos.startsWith('4')) return 'Visa'
  if (digitos.startsWith('5')) return 'Mastercard'
  return 'Cartao'
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS (função nova, nada mais mudou).

- [ ] **Step 3: Commit**

```bash
git add src/utils/mascaras.ts
git commit -m "feat: detectar bandeira do cartao pelo primeiro digito"
```

---

### Task 2: Renomear "recibo" para "comprovante" no motor de pagamento

**Files:**
- Modify: `src/data/pagamentoService.ts`

**Interfaces:**
- Produces: `gerarComprovantePDF(pagamento: Pagamento, nomeAluno: string): void`
  (renomeado de `gerarReciboPDF`) — usado pela Task 3 (`ComprovantePagamento.tsx`).
  `processarPagamento` continua com a mesma assinatura, só troca o prefixo do número
  gerado internamente.

- [ ] **Step 1: Substituir o conteúdo do arquivo**

```ts
import jsPDF from 'jspdf'
import type { MetodoPagamento, Pagamento } from '../types'
import { obterPagamentos, salvarPagamento } from './pagamentoRepository'

const DELAY_SIMULADO_MS = 1200
const CHANCE_DE_RECUSA = 0.1

function proximoNumeroComprovante(): string {
  const pagamentos = obterPagamentos()
  const quantidadeComComprovante = pagamentos.filter((pagamento) => pagamento.receiptNumber).length
  return `CMP-${String(quantidadeComComprovante + 1).padStart(4, '0')}`
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
    receiptNumber: proximoNumeroComprovante(),
  }

  salvarPagamento(pagamentoAtualizado)

  return { aprovado: true, pagamentoAtualizado }
}

export function gerarComprovantePDF(pagamento: Pagamento, nomeAluno: string): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('BigGym - Comprovante de Pagamento', 20, 20)
  doc.setFontSize(12)
  doc.text(`Comprovante: ${pagamento.receiptNumber ?? ''}`, 20, 40)
  doc.text(`Aluno: ${nomeAluno}`, 20, 50)
  doc.text(`Valor pago: R$ ${(pagamento.paidValue ?? 0).toFixed(2)}`, 20, 60)
  doc.text(`Data do pagamento: ${pagamento.paymentDate ?? ''}`, 20, 70)
  doc.text(`Metodo: ${pagamento.paymentMethod ?? ''}`, 20, 80)
  doc.save(`${pagamento.receiptNumber ?? 'comprovante'}.pdf`)
}
```

- [ ] **Step 2: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/data/pagamentoService.ts
git commit -m "refactor: renomear recibo para comprovante no motor de pagamento"
```

---

### Task 3: Criar pasta `components/pagamento` e o componente visual do comprovante

**Files:**
- Create: `src/components/pagamento/ComprovantePagamento.tsx`
- Create: `src/components/pagamento/index.ts`

**Interfaces:**
- Consumes: `gerarComprovantePDF` (Task 2); `Button` de `../common`
  (já existe, `src/components/common/Button.tsx`).
- Produces: componente `<ComprovantePagamento pagamento nomeAluno cpf planoNome
  bandeira? ultimosDigitos? onContinuar />` — usado pela Task 5
  (`PagamentoCheckout.tsx`).

- [ ] **Step 1: Criar o componente visual**

Create `src/components/pagamento/ComprovantePagamento.tsx`:

```tsx
import { Check, Download } from 'lucide-react'
import { Button } from '../common'
import { gerarComprovantePDF } from '../../data/pagamentoService'
import biggymIcon from '../../assets/biggym-icon-black.png'
import type { Pagamento } from '../../types'

const CHAVE_PIX_FAKE = 'academia@biggym.com'

const LABEL_METODO: Record<string, string> = {
  pix: 'Pix',
  creditCard: 'Cartao de credito',
  debitCard: 'Cartao de debito',
  cash: 'Dinheiro',
  partner: 'Parceiro',
}

interface ComprovantePagamentoProps {
  pagamento: Pagamento
  nomeAluno: string
  cpf: string
  planoNome: string
  bandeira?: string
  ultimosDigitos?: string
  onContinuar: () => void
}

function formatarData(data: string | null): string {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// So pra exibicao no comprovante - nao cria nenhum registro de Pagamento novo.
// A cobranca recorrente de verdade e responsabilidade de uma feature futura.
function calcularProximoVencimento(dataPagamento: string | null): string {
  if (!dataPagamento) return ''
  const data = new Date(dataPagamento)
  data.setMonth(data.getMonth() + 1)
  return formatarData(data.toISOString().slice(0, 10))
}

function LinhaComprovante({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{valor}</span>
    </div>
  )
}

export function ComprovantePagamento({
  pagamento,
  nomeAluno,
  cpf,
  planoNome,
  bandeira,
  ultimosDigitos,
  onContinuar,
}: ComprovantePagamentoProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-4">
      <div className="flex w-full justify-end">
        <Button type="button" variant="secondary" onClick={() => gerarComprovantePDF(pagamento, nomeAluno)}>
          <Download size={16} />
          Baixar comprovante
        </Button>
      </div>

      <img src={biggymIcon} alt="BigGym" className="mt-4 h-10 w-10" />

      <span className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check size={28} />
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">Pagamento aprovado</p>
      <p className="text-lg text-slate-400">R$ {(pagamento.paidValue ?? 0).toFixed(2)}</p>

      <div className="mt-6 w-full">
        <LinhaComprovante label="Aluno" valor={nomeAluno} />
        <LinhaComprovante label="CPF" valor={cpf} />
        <LinhaComprovante label="Plano" valor={planoNome} />
        <LinhaComprovante label="Forma de pagamento" valor={LABEL_METODO[pagamento.paymentMethod ?? ''] ?? ''} />
        {bandeira && ultimosDigitos ? (
          <LinhaComprovante label="Bandeira" valor={`${bandeira} •••• ${ultimosDigitos}`} />
        ) : null}
        {pagamento.paymentMethod === 'pix' ? <LinhaComprovante label="Chave Pix" valor={CHAVE_PIX_FAKE} /> : null}
        <LinhaComprovante label="Data do pagamento" valor={formatarData(pagamento.paymentDate)} />
        <LinhaComprovante label="Proximo vencimento" valor={calcularProximoVencimento(pagamento.paymentDate)} />
        <LinhaComprovante label="Comprovante no" valor={pagamento.receiptNumber ?? ''} />
      </div>

      <Button type="button" className="mt-6" onClick={onContinuar}>
        Continuar para cadastro do rosto
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Criar o barrel**

Create `src/components/pagamento/index.ts`:

```ts
export * from './ComprovantePagamento'
```

(A exportação do `PagamentoCheckout` entra aqui na Task 5, quando o arquivo existir
nesta pasta.)

- [ ] **Step 3: Rodar o typecheck**

Run: `npm run typecheck`
Expected: FAIL — `ComprovantePagamento.tsx` importa de `../common` e `../../data/...`,
mas ainda não é importado por nada, então o TypeScript só reclama se algo estiver
errado na própria tipagem do arquivo. Se der erro de tipo, corrija antes de continuar;
se passar, siga.

- [ ] **Step 4: Commit**

```bash
git add src/components/pagamento
git commit -m "feat: criar tela visual do comprovante de pagamento"
```

---

### Task 4: Mover o `PagamentoCheckout` para `components/pagamento` com máquina de estados

**Files:**
- Create: `src/components/pagamento/PagamentoCheckout.tsx`
- Delete: `src/features/attendant/PagamentoCheckout.tsx`
- Modify: `src/components/pagamento/index.ts`

**Interfaces:**
- Consumes: `processarPagamento` (`../../data/pagamentoService`),
  `formatarNumeroCartao`, `formatarValidadeCartao`, `detectarBandeiraCartao`
  (`../../utils/mascaras`, Task 1), `ComprovantePagamento` (Task 3).
- Produces: componente `<PagamentoCheckout pagamento nomeAluno cpf planoNome
  onAprovado />` — usado pela Task 5 (`AttendantCadastroPage.tsx`). Note que ganhou
  dois props novos (`cpf`, `planoNome`) em relação à versão antiga.

- [ ] **Step 1: Criar o novo arquivo**

Create `src/components/pagamento/PagamentoCheckout.tsx`:

```tsx
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check } from 'lucide-react'
import { Button, Card } from '../common'
import { processarPagamento } from '../../data/pagamentoService'
import { formatarNumeroCartao, formatarValidadeCartao, detectarBandeiraCartao } from '../../utils/mascaras'
import type { MetodoPagamento, Pagamento } from '../../types'
import { ComprovantePagamento } from './ComprovantePagamento'

const CHAVE_PIX_FAKE = 'academia@biggym.com'

type EstadoPagamento = 'selecionando' | 'processando' | 'check' | 'aprovado'

interface PagamentoCheckoutProps {
  pagamento: Pagamento
  nomeAluno: string
  cpf: string
  planoNome: string
  onAprovado: (pagamentoAtualizado: Pagamento) => void
}

const METODOS: { id: MetodoPagamento; label: string }[] = [
  { id: 'pix', label: 'Pix' },
  { id: 'creditCard', label: 'Cartao de credito' },
  { id: 'debitCard', label: 'Cartao de debito' },
  { id: 'cash', label: 'Dinheiro' },
]

// Dado de cartao (numero/validade/cvv) fica só neste estado local e nunca é
// persistido em nenhum repository — some quando o componente desmonta. Só a
// bandeira e os ultimos 4 digitos (derivados) chegam no comprovante.
export function PagamentoCheckout({ pagamento, nomeAluno, cpf, planoNome, onAprovado }: PagamentoCheckoutProps) {
  const [estado, setEstado] = useState<EstadoPagamento>('selecionando')
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null)
  const [numeroCartao, setNumeroCartao] = useState('')
  const [validadeCartao, setValidadeCartao] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [pagamentoAprovado, setPagamentoAprovado] = useState<Pagamento | null>(null)

  const codigoPixSimulado = `PIX-SIMULADO-${pagamento.id}-${pagamento.originalValue.toFixed(2)}`

  useEffect(() => {
    if (metodo !== 'pix') return
    QRCode.toDataURL(codigoPixSimulado).then(setQrCodeUrl)
  }, [metodo, codigoPixSimulado])

  useEffect(() => {
    if (estado !== 'check') return
    const timer = setTimeout(() => setEstado('aprovado'), 600)
    return () => clearTimeout(timer)
  }, [estado])

  async function handleConfirmar() {
    if (!metodo) return
    setErro('')
    setEstado('processando')
    const { aprovado, pagamentoAtualizado } = await processarPagamento(pagamento, metodo)

    if (!aprovado) {
      setErro('Pagamento recusado. Tente novamente ou escolha outro metodo.')
      setEstado('selecionando')
      return
    }

    setPagamentoAprovado(pagamentoAtualizado)
    setEstado('check')
  }

  function handleCopiarCodigoPix() {
    navigator.clipboard.writeText(codigoPixSimulado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const cartaoValido =
    numeroCartao.replace(/\D/g, '').length === 16 && validadeCartao.length === 5 && cvv.length >= 3 && nomeCartao.trim().length > 0

  if (estado === 'processando') {
    return (
      <Card title="Pagamento">
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-rose-800" />
          <p className="text-sm text-slate-600">Processando pagamento...</p>
        </div>
      </Card>
    )
  }

  if (estado === 'check') {
    return (
      <Card title="Pagamento">
        <div className="flex flex-col items-center gap-3 py-10">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={32} />
          </span>
          <p className="text-sm font-medium text-emerald-700">Pagamento confirmado</p>
        </div>
      </Card>
    )
  }

  if (estado === 'aprovado' && pagamentoAprovado) {
    const ehCartao = pagamentoAprovado.paymentMethod === 'creditCard' || pagamentoAprovado.paymentMethod === 'debitCard'
    return (
      <ComprovantePagamento
        pagamento={pagamentoAprovado}
        nomeAluno={nomeAluno}
        cpf={cpf}
        planoNome={planoNome}
        bandeira={ehCartao ? detectarBandeiraCartao(numeroCartao) : undefined}
        ultimosDigitos={ehCartao ? numeroCartao.replace(/\D/g, '').slice(-4) : undefined}
        onContinuar={() => onAprovado(pagamentoAprovado)}
      />
    )
  }

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
          disabled={(metodo === 'creditCard' || metodo === 'debitCard') && !cartaoValido}
          onClick={handleConfirmar}
        >
          Confirmar pagamento
        </Button>
      ) : null}
    </Card>
  )
}
```

- [ ] **Step 2: Apagar o arquivo antigo**

```bash
git rm src/features/attendant/PagamentoCheckout.tsx
```

- [ ] **Step 3: Atualizar o barrel**

Replace `src/components/pagamento/index.ts`:

```ts
export * from './ComprovantePagamento'
export * from './PagamentoCheckout'
```

- [ ] **Step 4: Rodar o typecheck**

Run: `npm run typecheck`
Expected: FAIL — `AttendantCadastroPage.tsx` ainda importa de `./PagamentoCheckout`,
que não existe mais. Isso é esperado, a Task 5 corrige.

- [ ] **Step 5: Commit**

```bash
git add src/components/pagamento
git commit -m "feat: mover pagamentocheckout para components e adicionar maquina de estados"
```

---

### Task 5: Ligar o novo fluxo em `AttendantCadastroPage.tsx`

**Files:**
- Modify: `src/features/attendant/AttendantCadastroPage.tsx`

**Interfaces:**
- Consumes: `<PagamentoCheckout>` com os props novos `cpf` e `planoNome` (Task 4).

- [ ] **Step 1: Trocar o import**

Troque:

```tsx
import { PagamentoCheckout } from './PagamentoCheckout'
```

Por:

```tsx
import { PagamentoCheckout } from '../../components/pagamento'
```

- [ ] **Step 2: Resolver o nome do plano selecionado**

Logo depois da linha `const planos = obterPlanos()`, adicione:

```ts
const planoSelecionadoNome = planos.find((plano) => plano.id === planoAtualId)?.name ?? ''
```

- [ ] **Step 3: Passar os novos props pro `PagamentoCheckout`**

Troque o bloco:

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

Por:

```tsx
{etapa === 'pagamento' && pagamentoPendente ? (
  <div className="mx-auto mt-6 max-w-xl">
    <PagamentoCheckout
      pagamento={pagamentoPendente}
      nomeAluno={fullName}
      cpf={cpf}
      planoNome={planoSelecionadoNome}
      onAprovado={() => setEtapa('captura')}
    />
  </div>
) : null}
```

- [ ] **Step 4: Rodar o typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Verificar no navegador**

Run: `npm run dev`. Entre como Atendente → "Cadastrar aluno" → preencha os dados sem
marcar "Visita teste", escolha um plano, envie. Na etapa "Pagamento", escolha um
método e confirme. Expected: aparece um spinner (~1.2s) → um check verde (~0.6s) →
o comprovante cheio de tela (sem moldura de "folha"), com ícone BigGym, "Pagamento
aprovado" em negrito, valor, e as linhas Aluno/CPF/Plano/Forma de pagamento/
Data do pagamento/Próximo vencimento/Comprovante nº (mais Bandeira se for cartão, ou
Chave Pix se for Pix). Clique em "Baixar comprovante" — um PDF
`CMP-00XX.pdf` com o texto "Comprovante de Pagamento" deve baixar, sem fechar a tela.
Clique em "Continuar para cadastro do rosto" — só agora avança pra etapa "Rosto".
Se cair no caso de recusa (~10% das vezes), confirme que volta pra seleção de método
com a mensagem de erro, sem mostrar comprovante.

- [ ] **Step 6: Commit**

```bash
git add src/features/attendant/AttendantCadastroPage.tsx
git commit -m "feat: ligar comprovante de pagamento ao fluxo de cadastro do atendente"
```

---

## Depois deste plano

Com `PagamentoCheckout` e `ComprovantePagamento` em `src/components/pagamento/`, a
feature futura do Aluno pagando sozinho (fora de escopo aqui) importa os dois direto
de lá — sem duplicar lógica de checkout, máquina de estados ou o visual do
comprovante.
