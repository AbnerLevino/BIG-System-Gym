
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck2,
  ClipboardList,
  Clock3,
  Users,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'
import {
  obterAlunos,
  obterAtendimentosPorProfissional,
  obterAvaliacoesFisicas,
} from '../../data'
import { useAuthStore } from '../../store/authStore'

interface AgendamentoDemo {
  id: string
  alunoId: string
  data: string
  horario: string
  atividade: string
}

const dataISO = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`

const dataRelativa = (dias: number) => {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  return dataISO(data)
}

const AGENDAMENTOS_DEMO: AgendamentoDemo[] = [
  {
    id: 'agenda-1',
    alunoId: 'sub-1',
    data: dataRelativa(0),
    horario: '08:00',
    atividade: 'Avaliação física',
  },
  {
    id: 'agenda-2',
    alunoId: 'sub-2',
    data: dataRelativa(0),
    horario: '10:30',
    atividade: 'Acompanhamento',
  },
  {
    id: 'agenda-3',
    alunoId: 'sub-1',
    data: dataRelativa(2),
    horario: '09:00',
    atividade: 'Treino personalizado',
  },
  {
    id: 'agenda-4',
    alunoId: 'sub-2',
    data: dataRelativa(4),
    horario: '14:00',
    atividade: 'Avaliação física',
  },
  {
    id: 'agenda-5',
    alunoId: 'sub-1',
    data: dataRelativa(6),
    horario: '08:30',
    atividade: 'Treino personalizado',
  },
  {
    id: 'agenda-6',
    alunoId: 'sub-2',
    data: dataRelativa(9),
    horario: '11:00',
    atividade: 'Acompanhamento',
  },
]

export function ProfessionalDashboardPage() {
  const usuarioAtual = useAuthStore(
    (state) => state.usuarioAtual,
  )

  const alunos = useMemo(() => {
    if (!usuarioAtual) return []

    const idsAlunos = new Set(
      obterAtendimentosPorProfissional(usuarioAtual.refId)
        .filter((atendimento) => atendimento.type === 'personal')
        .map((atendimento) => atendimento.alunoId),
    )

    return obterAlunos().filter((aluno) =>
      idsAlunos.has(aluno.id),
    )
  }, [usuarioAtual])

  const avaliacoes = obterAvaliacoesFisicas()

  const avaliados = alunos.filter((aluno) =>
    avaliacoes.some(
      (avaliacao) => avaliacao.alunoId === aluno.id,
    ),
  ).length

  const alunosPorId = new Map(
    alunos.map((aluno) => [aluno.id, aluno]),
  )

  const proximosAtendimentos = useMemo(() => {
    const agora = new Date()

    return AGENDAMENTOS_DEMO
      .filter((item) => alunosPorId.has(item.alunoId))
      .filter((item) => {
        const dataHorario = new Date(
          `${item.data}T${item.horario}:00`,
        )

        return dataHorario >= agora
      })
      .sort((a, b) => {
        const dataA = `${a.data}T${a.horario}`
        const dataB = `${b.data}T${b.horario}`

        return dataA.localeCompare(dataB)
      })
  }, [alunosPorId])

  function formatarData(data: string) {
    return new Date(`${data}T12:00:00`).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'short',
      },
    )
  }

  return (
    <AppLayout>
      <div className="space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Área profissional
            </p>

            <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Visão geral das suas atividades profissionais.
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right">
            <p className="text-xs text-emerald-700">
              Profissional
            </p>

            <p className="font-semibold text-emerald-900">
              {usuarioAtual?.nome}
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="!p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Alunos personal
              </span>

              <Users className="text-emerald-700" size={20} />
            </div>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {alunos.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Vinculados a você
            </p>
          </Card>

          <Card className="!p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Avaliações registradas
              </span>

              <ClipboardList
                className="text-emerald-700"
                size={20}
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {avaliados}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Alunos com avaliação
            </p>
          </Card>

          <Card className="!p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Agendamentos demonstrativos
              </span>

              <CalendarCheck2
                className="text-emerald-700"
                size={20}
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {AGENDAMENTOS_DEMO.filter((item) =>
                alunosPorId.has(item.alunoId),
              ).length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Agenda de exemplo
            </p>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Próximos atendimentos
            </h2>

            <p className="text-sm text-slate-500">
              Seus próximos compromissos com alunos vinculados.
            </p>
          </div>

          {proximosAtendimentos.length > 0 ? (
            <Card>
              <div className="divide-y divide-slate-100">
                {proximosAtendimentos.map((item) => {
                  const aluno = alunosPorId.get(item.alunoId)

                  if (!aluno) return null

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                          <Clock3 size={19} />
                        </div>

                        <div className="min-w-0">
                          <Link
                            to={`/profissional/alunos/${aluno.id}`}
                            className="truncate text-sm font-semibold text-slate-800 hover:text-emerald-700"
                          >
                            {aluno.fullName}
                          </Link>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.atividade}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">
                          {formatarData(item.data)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.horario}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="py-8 text-center">
                <CalendarCheck2
                  className="mx-auto mb-3 text-slate-300"
                  size={32}
                />

                <p className="font-medium text-slate-700">
                  Nenhum próximo atendimento
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Não há atendimentos demonstrativos futuros para seus alunos vinculados.
                </p>
              </div>
            </Card>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
