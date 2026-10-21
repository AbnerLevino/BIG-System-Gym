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
