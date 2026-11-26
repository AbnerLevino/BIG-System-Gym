// "Meu plano" do aluno: o plano atual em destaque, com o que entra na cobrança, e
// os outros planos da academia pra consulta. Trocar de plano é feito na recepção
// (RF-ATD-10), não pelo app.
import { CalendarDays, Info, Receipt } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { CartaoPlano } from '../../components/plano'
import {
  obterAlunoPorId,
  obterAtendimentoPersonalPorAluno,
  obterPlanoPorId,
  obterPlanos,
  obterProfissionalPorId,
  obterProximoPagamentoEmAberto,
} from '../../data'
import { useAuthStore } from '../../store/authStore'

function formatarDataBr(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

export function SubscriberPlanoPage() {
  const alunoId = useAuthStore((state) => state.usuarioAtual!.refId)
  const aluno = obterAlunoPorId(alunoId)
  const planoAtual = aluno?.planoAtualId ? obterPlanoPorId(aluno.planoAtualId) : undefined
  const outrosPlanos = obterPlanos().filter((plano) => plano.id !== planoAtual?.id)
  const personal = obterAtendimentoPersonalPorAluno(alunoId)
  const nomePersonal = personal ? obterProfissionalPorId(personal.profissionalId)?.name : undefined
  const proximoPagamento = obterProximoPagamentoEmAberto(alunoId)

  return (
    <AppLayout>
      <h1 className="font-heading text-2xl font-semibold text-slate-900">Meu plano</h1>
      <p className="text-sm text-slate-500">O que está incluído na sua matrícula.</p>

      {planoAtual && aluno ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <CartaoPlano plano={planoAtual} destaque="Seu plano" />

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-zinc-50/60 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays size={16} className="text-emerald-700" /> Matrícula desde {formatarDataBr(aluno.startDate)}
              </p>
              {proximoPagamento ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <Receipt size={16} className="text-emerald-700" /> Próxima cobrança: {formatarMoeda(proximoPagamento.originalValue)}{' '}
                  em {formatarDataBr(proximoPagamento.dueDate)}
                </p>
              ) : null}
            </div>

            {personal ? (
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-900">Personal trainer{nomePersonal ? `: ${nomePersonal}` : ''}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {personal.value ? `+ ${formatarMoeda(personal.value)} ` : ''}somado na mesma mensalidade do plano — não é uma
                  cobrança separada.
                </p>
              </div>
            ) : null}

            <p className="flex items-start gap-2 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
              <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
              Quer mudar de plano? Fale com a recepção da academia. Cobranças já geradas não mudam de valor.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">Você ainda não tem um plano ativo.</p>
          <p className="mt-1 text-xs text-slate-500">Procure a recepção para escolher um plano.</p>
        </div>
      )}

      {outrosPlanos.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Outros planos da academia</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {outrosPlanos.map((plano) => (
              <CartaoPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </section>
      ) : null}
    </AppLayout>
  )
}
