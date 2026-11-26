// RF-ALU-09: vitrine de personal trainers e contratação.
// D11 — aluno com personal vinculado vê só esse profissional, sem vitrine.
// D12 — contratar atualiza o Atendimento; nenhum pagamento nasce agora, o valor
//       entra somado na próxima mensalidade.
// Agenda e valor ainda são de exemplo (ver vitrinePersonalService.ts).
import { useState } from 'react'
import { CalendarDays, Check, Info } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Modal } from '../../components/common'
import { contratarPersonal, obterPersonaisDisponiveis, obterPersonalDoAluno, type PersonalNaVitrine } from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { AgendaProfissional, DiaSemana } from '../../types'
import { formatarMoeda } from '../../utils/formatacao'

const DIA_CURTO: Record<DiaSemana, string> = {
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
  sabado: 'Sáb',
  domingo: 'Dom',
}


function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

function Agenda({ agenda }: { agenda: AgendaProfissional[] }) {
  if (agenda.length === 0) {
    return <p className="text-xs text-slate-500">Agenda ainda não informada.</p>
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {agenda.map((item) => (
        <li key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
          <span className="w-9 shrink-0 rounded-md bg-emerald-50 py-0.5 text-center text-xs font-bold text-emerald-700">
            {DIA_CURTO[item.diaSemana]}
          </span>
          {item.horaInicio} – {item.horaFim}
        </li>
      ))}
    </ul>
  )
}

function CabecalhoPersonal({ personal, tamanho = 'md' }: { personal: PersonalNaVitrine; tamanho?: 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-white ${
          tamanho === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-base'
        }`}
      >
        {iniciais(personal.profissional.name)}
      </span>
      <div className="min-w-0">
        <p className={`font-heading font-semibold text-slate-900 ${tamanho === 'lg' ? 'text-2xl' : 'text-lg'}`}>
          {personal.profissional.name}
        </p>
        <p className="text-sm font-medium text-emerald-700">{personal.profissional.specialization}</p>
      </div>
    </div>
  )
}

export function SubscriberPersonalPage() {
  const alunoId = useAuthStore((state) => state.usuarioAtual!.refId)
  const [versao, setVersao] = useState(0)
  const [escolhido, setEscolhido] = useState<PersonalNaVitrine | null>(null)
  const [contratadoAgora, setContratadoAgora] = useState(false)

  const meuPersonal = obterPersonalDoAluno(alunoId)
  const personais = meuPersonal ? [] : obterPersonaisDisponiveis()

  function handleConfirmar() {
    if (!escolhido) return
    contratarPersonal(alunoId, escolhido.profissional.id)
    setEscolhido(null)
    setContratadoAgora(true)
    setVersao((atual) => atual + 1)
  }

  return (
    <AppLayout>
      <div key={versao} className="mx-auto max-w-5xl">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Personal trainer</h1>

        {meuPersonal ? (
          // D11: com personal vinculado, só ele aparece.
          <>
            <p className="text-sm text-slate-500">Quem acompanha o seu treino de perto.</p>
            {contratadoAgora ? (
              <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                <Check size={16} /> Personal contratado! O valor entra na sua próxima mensalidade.
              </p>
            ) : null}
            <div className="mt-6 grid gap-6 rounded-2xl border-2 border-emerald-700 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]">
              <div>
                <CabecalhoPersonal personal={meuPersonal} tamanho="lg" />
                {meuPersonal.profissional.notes ? (
                  <p className="mt-4 text-sm text-slate-600">{meuPersonal.profissional.notes}</p>
                ) : null}
                <p className="mt-4 text-sm text-slate-600">
                  <strong className="text-slate-900">+ {formatarMoeda(meuPersonal.valorMensal)}</strong> por mês, somado na
                  mesma mensalidade do seu plano.
                </p>
              </div>
              <div className="min-w-[200px] rounded-xl bg-zinc-50 p-4">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <CalendarDays size={12} /> Horários de atendimento
                </p>
                <Agenda agenda={meuPersonal.agenda} />
              </div>
            </div>
          </>
        ) : (
          // Aluno 'standard': vitrine.
          <>
            <p className="text-sm text-slate-500">
              Treine com acompanhamento individual. O valor do personal vem junto da sua mensalidade — sem cobrança separada.
            </p>
            {personais.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">Nenhum personal trainer disponível no momento.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {personais.map((personal) => (
                  <div key={personal.profissional.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <CabecalhoPersonal personal={personal} />
                    {personal.profissional.notes ? (
                      <p className="mt-3 text-sm text-slate-600">{personal.profissional.notes}</p>
                    ) : null}
                    <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <CalendarDays size={12} /> Agenda
                      </p>
                      <Agenda agenda={personal.agenda} />
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <p>
                        <span className="font-heading text-xl font-semibold text-emerald-700">{formatarMoeda(personal.valorMensal)}</span>
                        <span className="text-xs text-slate-500"> /mês</span>
                      </p>
                      <Button onClick={() => setEscolhido(personal)}>Contratar</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-8 flex items-center gap-1.5 text-xs text-slate-400">
          <Info size={12} /> Valores de demonstração — a agenda é a cadastrada por cada profissional.
        </p>
      </div>

      <Modal open={escolhido !== null} title="Contratar personal" onClose={() => setEscolhido(null)}>
        {escolhido ? (
          <div className="flex flex-col gap-4">
            <CabecalhoPersonal personal={escolhido} />
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">+ {formatarMoeda(escolhido.valorMensal)} por mês</strong>, somado na sua
              próxima mensalidade. Nada é cobrado agora.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEscolhido(null)}>
                Voltar
              </Button>
              <Button onClick={handleConfirmar}>Confirmar contratação</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  )
}
