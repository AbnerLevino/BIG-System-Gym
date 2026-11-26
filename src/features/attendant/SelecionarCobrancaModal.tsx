// "Registrar pagamento" da Central da Recepção: lista as cobranças em aberto
// (pending/late) de matrículas não canceladas e leva pro recebimento no balcão
// (/atendente/pagamento/:alunoId), que já existe.
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Modal } from '../../components/common'
import { obterAlunos, obterProximoPagamentoEmAberto } from '../../data'
import { AvatarAluno } from '../../components/aluno'

function formatarDataBr(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

interface SelecionarCobrancaModalProps {
  open: boolean
  onClose: () => void
}

export function SelecionarCobrancaModal({ open, onClose }: SelecionarCobrancaModalProps) {
  const navigate = useNavigate()
  const cobrancas = open
    ? obterAlunos()
        .filter((aluno) => aluno.status !== 'cancelled')
        .map((aluno) => ({ aluno, pagamento: obterProximoPagamentoEmAberto(aluno.id) }))
        .filter((item) => item.pagamento !== undefined)
        // Atrasados primeiro, depois por vencimento.
        .sort((a, b) => {
          const atrasoA = a.pagamento!.status === 'late' ? 0 : 1
          const atrasoB = b.pagamento!.status === 'late' ? 0 : 1
          return atrasoA - atrasoB || a.pagamento!.dueDate.localeCompare(b.pagamento!.dueDate)
        })
    : []

  return (
    <Modal open={open} title="Registrar pagamento" size="lg" onClose={onClose}>
      <p className="text-sm text-slate-600">Escolha a cobranca em aberto que o aluno vai pagar no balcao.</p>
      {cobrancas.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Nenhuma cobranca em aberto.</p>
          <p className="mt-1 text-xs text-slate-500">Todos os alunos estao com a mensalidade em dia.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {cobrancas.map(({ aluno, pagamento }) => {
            const atrasado = pagamento!.status === 'late'
            return (
              <li key={aluno.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/atendente/pagamento/${aluno.id}`)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50/60"
                >
                  <AvatarAluno aluno={aluno} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{aluno.fullName}</p>
                    <p className={`text-xs ${atrasado ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
                      {atrasado ? 'Atrasado' : 'Em aberto'} · venc. {formatarDataBr(pagamento!.dueDate)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">R$ {pagamento!.originalValue.toFixed(2)}</span>
                  <ChevronRight size={16} className="shrink-0 text-slate-300 group-hover:text-emerald-700" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
