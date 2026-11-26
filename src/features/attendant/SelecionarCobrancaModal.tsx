// "Registrar pagamento" da Central da Recepção: lista as cobranças em aberto
// (pending/late) de matrículas não canceladas e abre o recebimento no balcão.
import { ChevronRight } from 'lucide-react'
import { Modal } from '../../components/common'
import { obterAlunos, obterProximoPagamentoEmAberto } from '../../data'
import { AvatarAluno } from '../../components/aluno'
import { EstadoVazio } from '../../components/painel'
import { formatarDataBr, formatarMoeda } from '../../utils/formatacao'


interface SelecionarCobrancaModalProps {
  open: boolean
  onClose: () => void
  onSelecionar: (alunoId: string) => void
}

export function SelecionarCobrancaModal({ open, onClose, onSelecionar }: SelecionarCobrancaModalProps) {
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
      <p className="text-sm text-slate-600">Escolha a cobrança em aberto que o aluno vai pagar no balcão.</p>
      {cobrancas.length === 0 ? (
        <EstadoVazio titulo="Nenhuma cobrança em aberto." descricao="Todos os alunos estão com a mensalidade em dia." />
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {cobrancas.map(({ aluno, pagamento }) => {
            const atrasado = pagamento!.status === 'late'
            return (
              <li key={aluno.id}>
                <button
                  type="button"
                  onClick={() => onSelecionar(aluno.id)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50/60"
                >
                  <AvatarAluno aluno={aluno} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{aluno.fullName}</p>
                    <p className={`text-xs ${atrasado ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
                      {atrasado ? 'Atrasado' : 'Em aberto'} · venc. {formatarDataBr(pagamento!.dueDate)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatarMoeda(pagamento!.originalValue)}</span>
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
