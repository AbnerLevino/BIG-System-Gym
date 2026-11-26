// RF-ALU-13: extrato/histórico de pagamentos do aluno logado. Só leitura —
// pagar a cobrança em aberto é pelo resumo em /aluno.
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { obterAlunoPorId, obterHistoricoDePagamentosDoAluno, obterPlanoPorId } from '../../data'
import { gerarComprovantePDF } from '../../data/pagamentoService'
import { useAuthStore } from '../../store/authStore'
import type { MetodoPagamento, StatusPagamento } from '../../types'

const COLUNAS = ['Vencimento', 'Plano', 'Valor', 'Situação', 'Pago em', 'Forma', 'Comprovante']

const LABEL_STATUS: Record<StatusPagamento, string> = {
  paid: 'Pago',
  pending: 'Em aberto',
  late: 'Atrasado',
}

const COR_STATUS: Record<StatusPagamento, string> = {
  paid: 'text-emerald-700',
  pending: 'text-amber-600',
  late: 'text-rose-600',
}

const LABEL_METODO: Record<MetodoPagamento, string> = {
  pix: 'Pix',
  creditCard: 'Cartão de crédito',
  debitCard: 'Cartão de débito',
  cash: 'Dinheiro',
  partner: 'Parceiro',
}

function formatarDataBr(data: string | null): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export function SubscriberFinanceiroPage() {
  const alunoId = useAuthStore((state) => state.usuarioAtual!.refId)
  const aluno = obterAlunoPorId(alunoId)
  const pagamentos = obterHistoricoDePagamentosDoAluno(alunoId)
  const temEmAberto = pagamentos.some((pagamento) => pagamento.status !== 'paid')

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Financeiro</h1>
      <p className="text-base text-slate-500">Histórico das suas mensalidades.</p>

      {temEmAberto ? (
        <p className="mt-4 text-sm text-slate-600">
          Você tem cobrança em aberto.{' '}
          <Link to="/aluno" className="font-semibold text-emerald-700 hover:underline">
            Pagar pelo resumo
          </Link>
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {COLUNAS.map((coluna) => (
            <span key={coluna} className="px-4 py-3">
              {coluna}
            </span>
          ))}
        </div>
        {pagamentos.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="divide-y divide-slate-200 text-sm text-slate-700">
            {pagamentos.map((pagamento) => (
              <div key={pagamento.id} className="grid h-12 grid-cols-7 items-center">
                <span className="px-4">{formatarDataBr(pagamento.dueDate)}</span>
                <span className="truncate px-4">{obterPlanoPorId(pagamento.planoId)?.name ?? '—'}</span>
                <span className="px-4">R$ {(pagamento.paidValue ?? pagamento.originalValue).toFixed(2)}</span>
                <span className={`px-4 font-medium ${COR_STATUS[pagamento.status]}`}>{LABEL_STATUS[pagamento.status]}</span>
                <span className="px-4">{formatarDataBr(pagamento.paymentDate)}</span>
                <span className="px-4">{pagamento.paymentMethod ? LABEL_METODO[pagamento.paymentMethod] : '—'}</span>
                <span className="px-4">
                  {pagamento.status === 'paid' ? (
                    <button
                      type="button"
                      onClick={() => gerarComprovantePDF(pagamento, aluno?.fullName ?? '')}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                    >
                      <Download size={14} /> PDF
                    </button>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
