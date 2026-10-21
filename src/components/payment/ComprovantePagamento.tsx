import type { ReactNode } from 'react'
import { Check, Download } from 'lucide-react'
import { Button } from '../common'
import { gerarComprovantePDF } from '../../data/pagamentoService'
import biggymIcon from '../../assets/biggym-icon-black.png'
import type { Pagamento } from '../../types'
import { CardBrandIcon } from './CardBrandIcon'

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

function LinhaComprovante({ label, valor }: { label: string; valor: ReactNode }) {
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
          <LinhaComprovante
            label="Bandeira"
            valor={
              <span className="flex items-center gap-2">
                <CardBrandIcon bandeira={bandeira} />
                {bandeira} •••• {ultimosDigitos}
              </span>
            }
          />
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
