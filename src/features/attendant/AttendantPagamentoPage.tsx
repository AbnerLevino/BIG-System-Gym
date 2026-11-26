// Recebimento no balcão de uma cobrança em aberto (pending/late) de um aluno já
// matriculado. Reaproveita o mesmo checkout simulado do cadastro — sem gateway real (D6).
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Card } from '../../components/common'
import { CabecalhoPagina } from '../../components/painel'
import { PagamentoCheckout } from '../../components/payment'
import { obterAlunoPorId, obterPlanoPorId, obterProximoPagamentoEmAberto } from '../../data'

export function AttendantPagamentoPage() {
  const { alunoId = '' } = useParams()
  const navigate = useNavigate()
  const aluno = obterAlunoPorId(alunoId)
  // Congela a cobrança aberta ao entrar na tela, pra ela não "sumir" no meio do checkout.
  const [pagamento] = useState(() => obterProximoPagamentoEmAberto(alunoId))

  const voltar = () => navigate(`/atendente?aluno=${alunoId}`)

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl">
        <Link
          to={`/atendente?aluno=${alunoId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft size={14} /> Voltar para a ficha do aluno
        </Link>
        <div className="mt-3">
          <CabecalhoPagina
            titulo="Pagamento no balcão"
            descricao={aluno ? `Cobrança em aberto de ${aluno.fullName}` : 'Receber mensalidade em aberto'}
          />
        </div>

        <div className="mt-6">
          {!aluno || !pagamento ? (
            <Card>
              <p className="text-sm text-slate-600">
                {aluno ? `${aluno.fullName} nao tem nenhuma cobranca em aberto.` : 'Aluno nao encontrado.'}
              </p>
              <Button className="mt-4" variant="secondary" onClick={() => navigate('/atendente')}>
                Voltar ao atendimento
              </Button>
            </Card>
          ) : (
            <PagamentoCheckout
              pagamento={pagamento}
              nomeAluno={aluno.fullName}
              cpf={aluno.cpf}
              planoNome={obterPlanoPorId(pagamento.planoId)?.name ?? ''}
              descricao={`Mensalidade de ${aluno.fullName}${pagamento.status === 'late' ? ' (atrasada)' : ''}`}
              onAprovado={voltar}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
