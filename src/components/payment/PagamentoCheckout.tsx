import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check } from 'lucide-react'
import { Button, Card } from '../common'
import { processarPagamento } from '../../data/pagamentoService'
import { formatarNumeroCartao, formatarValidadeCartao, detectarBandeiraCartao } from '../../utils/mascaras'
import type { MetodoPagamento, Pagamento } from '../../types'
import { ComprovantePagamento } from './ComprovantePagamento'
import { CardBrandIcon } from './CardBrandIcon'

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

  const digitosCartao = numeroCartao.replace(/\D/g, '')
  const bandeiraDigitada = digitosCartao.length > 0 ? detectarBandeiraCartao(numeroCartao) : null
  // American Express tem 15 digitos de verdade, nao 16 — as outras bandeiras usam 16.
  const tamanhoEsperadoCartao = bandeiraDigitada === 'American Express' ? 15 : 16
  const cartaoValido =
    digitosCartao.length === tamanhoEsperadoCartao && validadeCartao.length === 5 && cvv.length >= 3 && nomeCartao.trim().length > 0

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
            <div className="relative mt-1">
              <input
                value={numeroCartao}
                onChange={(e) => setNumeroCartao(formatarNumeroCartao(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-11 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
              />
              <CardBrandIcon
                bandeira={bandeiraDigitada}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
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
