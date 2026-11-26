
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
  obterAgendaPorProfissional,
  diaSemanaDeHoje,
} from '../../data'
import type { DiaSemana } from '../../types'
import { useAuthStore } from '../../store/authStore'

const NOME_DIA: Record<DiaSemana, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

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

  // Agenda semanal recorrente (AgendaProfissional) — a mesma que a vitrine do aluno lê.
  const grade = usuarioAtual ? obterAgendaPorProfissional(usuarioAtual.refId) : []
  const hoje = diaSemanaDeHoje()
  const horariosHoje = grade.filter((item) => item.diaSemana === hoje)

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
                Horários na semana
              </span>

              <CalendarCheck2
                className="text-emerald-700"
                size={20}
              />
            </div>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {grade.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {horariosHoje.length > 0 ? `Hoje: ${horariosHoje.map((h) => `${h.horaInicio}–${h.horaFim}`).join(', ')}` : 'Sem atendimento hoje'}
            </p>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Agenda semanal</h2>
              <p className="text-sm text-slate-500">Seus horários de atendimento, repetidos toda semana.</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/profissional/avaliacoes"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                Avaliações físicas
              </Link>
              <Link
                to="/profissional/agenda"
                className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Editar agenda
              </Link>
            </div>
          </div>

          <Card>
            {grade.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {grade.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                        <Clock3 size={19} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {NOME_DIA[item.diaSemana]}
                        {item.diaSemana === hoje && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Hoje
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.horaInicio}–{item.horaFim}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarCheck2 className="mx-auto mb-3 text-slate-300" size={32} />
                <p className="font-medium text-slate-700">Nenhum horário cadastrado</p>
                <p className="mt-1 text-sm text-slate-500">Cadastre seus horários em "Editar agenda".</p>
              </div>
            )}
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}
