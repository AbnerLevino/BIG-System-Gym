// Recebimento no balcão de uma cobrança em aberto (pending/late) de um aluno já
// matriculado — abre em modal na Central (?pagamento=alunoId). Reaproveita o mesmo
// checkout simulado do cadastro — sem gateway real (D6).
import { useState } from 'react'
import { Alerta, Button } from '../../components/common'
import { CabecalhoFicha } from '../../components/aluno'
import { PagamentoCheckout } from '../../components/payment'
import { obterAlunoPorId, obterPlanoPorId, obterProximoPagamentoEmAberto } from '../../data'

interface RecebimentoBalcaoProps {
  alunoId: string
  // Chamado quando o atendente clica em "Continuar" no comprovante.
  onConcluido: () => void
  onVoltarFicha: () => void
}

export function RecebimentoBalcao({ alunoId, onConcluido, onVoltarFicha }: RecebimentoBalcaoProps) {
  const aluno = obterAlunoPorId(alunoId)
  // Congela a cobrança aberta ao abrir, pra ela não "sumir" no meio do checkout.
  const [pagamento] = useState(() => obterProximoPagamentoEmAberto(alunoId))

  if (!aluno) return <Alerta tipo="erro">Aluno não encontrado.</Alerta>

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoFicha
        aluno={aluno}
        acoes={
          <Button variant="secondary" onClick={onVoltarFicha}>
            Ver ficha
          </Button>
        }
      />
      {!pagamento ? (
        <Alerta tipo="info">{aluno.fullName} não tem nenhuma cobrança em aberto.</Alerta>
      ) : (
        <PagamentoCheckout
          pagamento={pagamento}
          nomeAluno={aluno.fullName}
          cpf={aluno.cpf}
          planoNome={obterPlanoPorId(pagamento.planoId)?.name ?? ''}
          descricao={`Mensalidade de ${aluno.fullName}${pagamento.status === 'late' ? ' (atrasada)' : ''}`}
          onAprovado={onConcluido}
        />
      )}
    </div>
  )
}
