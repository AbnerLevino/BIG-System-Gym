// RF-ALU-11/12: resumo do aluno — próximo pagamento (com pagamento pelo próprio
// app), treino do dia e meta ativa. Histórico de pagamentos fica em /aluno/financeiro.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Dumbbell, Target, Wallet } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Modal } from '../../components/common'
import { PagamentoCheckout } from '../../components/payment'
import {
  agruparExerciciosPorDia,
  diaSemanaDeHoje,
  obterAlunoPorId,
  obterExercicioPorId,
  obterMetaAtivaDoAluno,
  obterPlanoPorId,
  obterProximoPagamentoEmAberto,
  obterTreinoDoAluno,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { DiaSemana, StatusPagamento, TipoMeta } from '../../types'

const LABEL_STATUS_PAGAMENTO: Record<StatusPagamento, string> = {
  paid: 'Pago',
  pending: 'Em aberto',
  late: 'Atrasado',
}

const CHIP_STATUS_PAGAMENTO: Record<StatusPagamento, string> = {
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  late: 'border-rose-200 bg-rose-50 text-rose-700',
}

const LABEL_DIA_COMPLETO: Record<DiaSemana, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const LABEL_TIPO_META: Record<TipoMeta, string> = {
  weight: 'Peso',
  measurement: 'Medida corporal',
  frequency: 'Frequência',
}

function formatarDataBr(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function LinkCard({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline">
      {children} <ArrowRight size={14} />
    </Link>
  )
}

export function SubscriberDashboardPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)!
  const alunoId = usuarioAtual.refId
  const aluno = obterAlunoPorId(alunoId)

  // Recarregar a tela depois de pagar = só reler o repository.
  const [versao, setVersao] = useState(0)
  const [pagando, setPagando] = useState(false)

  const proximoPagamento = obterProximoPagamentoEmAberto(alunoId)
  const plano = proximoPagamento ? obterPlanoPorId(proximoPagamento.planoId) : undefined
  const hoje = diaSemanaDeHoje()
  const exerciciosDeHoje = agruparExerciciosPorDia(obterTreinoDoAluno(alunoId))[hoje]
  // Status calculado pelo sistema quando não há personal (metaService.ts).
  const metaComProgresso = obterMetaAtivaDoAluno(alunoId)
  const metaAtiva = metaComProgresso?.meta
  const progressoMeta = metaComProgresso?.progresso

  return (
    <AppLayout>
      <div key={versao}>
        <h1 className="text-2xl font-bold">Olá, {aluno?.fullName.split(' ')[0] ?? usuarioAtual.nome}!</h1>
        <p className="text-base text-slate-500">Seu resumo de hoje.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Wallet size={16} /> Próximo pagamento
            </div>
            {proximoPagamento ? (
              <>
                <p className="mt-3 text-3xl font-bold text-slate-900">R$ {proximoPagamento.originalValue.toFixed(2)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <CalendarClock size={14} /> Vence em {formatarDataBr(proximoPagamento.dueDate)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CHIP_STATUS_PAGAMENTO[proximoPagamento.status]}`}
                >
                  {LABEL_STATUS_PAGAMENTO[proximoPagamento.status]}
                </span>
                {proximoPagamento.status === 'late' ? (
                  <p className="mt-2 text-xs text-rose-600">Com o pagamento atrasado, o check-in na catraca fica bloqueado.</p>
                ) : null}
                <div>
                  <Button className="mt-4" onClick={() => setPagando(true)}>
                    Pagar agora
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-emerald-700">Tudo em dia — nenhuma cobrança em aberto.</p>
            )}
            <div>
              <LinkCard to="/aluno/financeiro">Ver extrato</LinkCard>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Dumbbell size={16} /> Treino de hoje
            </div>
            <p className="mt-3 font-semibold text-slate-900">{LABEL_DIA_COMPLETO[hoje]}</p>
            {exerciciosDeHoje.length > 0 ? (
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {exerciciosDeHoje.map((item) => (
                  <li key={`${item.exercicioId}-${item.diaSemana}`} className="flex justify-between gap-3 py-2">
                    <span className="text-slate-700">{obterExercicioPorId(item.exercicioId)?.nome ?? item.exercicioId}</span>
                    <span className="shrink-0 text-slate-500">
                      {item.sets}x{item.reps}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Nenhum exercício para hoje.</p>
            )}
            <div>
              <LinkCard to="/aluno/treino">Ver treino da semana</LinkCard>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Target size={16} /> Meta ativa
            </div>
            {metaAtiva ? (
              <>
                <p className="mt-3 font-semibold text-slate-900">{metaAtiva.description}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {LABEL_TIPO_META[metaAtiva.type]} · alvo {metaAtiva.targetValue}
                </p>
                <p className="mt-1 text-sm text-slate-600">Prazo: {formatarDataBr(metaAtiva.deadline)}</p>
                {progressoMeta?.valorAtual !== undefined ? (
                  <p className="mt-1 text-sm text-slate-600">Hoje: {progressoMeta.valorAtual}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Você não tem nenhuma meta ativa no momento.</p>
            )}
            <div>
              <LinkCard to="/aluno/objetivos">{metaAtiva ? 'Ver objetivos' : 'Definir meu objetivo'}</LinkCard>
            </div>
          </Card>
        </div>
      </div>

      {/* RF-ALU-12: o mesmo checkout simulado do balcão, sem sair do app (D6). */}
      <Modal open={pagando && proximoPagamento !== undefined} title="Pagar mensalidade" size="lg" onClose={() => setPagando(false)}>
        {proximoPagamento && aluno ? (
          <PagamentoCheckout
            pagamento={proximoPagamento}
            nomeAluno={aluno.fullName}
            cpf={aluno.cpf}
            planoNome={plano?.name ?? ''}
            descricao={`Mensalidade com vencimento em ${formatarDataBr(proximoPagamento.dueDate)}`}
            metodosPermitidos={['pix', 'creditCard', 'debitCard']}
            onAprovado={() => {
              setPagando(false)
              setVersao((atual) => atual + 1)
            }}
          />
        ) : null}
      </Modal>
    </AppLayout>
  )
}
