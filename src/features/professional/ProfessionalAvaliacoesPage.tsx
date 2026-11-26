
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Search,
  UserRound,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'
import {
  obterAlunos,
  obterAtendimentosPorProfissional,
  obterAvaliacoesFisicas,
} from '../../data'
import { useAuthStore } from '../../store/authStore'

export function ProfessionalAvaliacoesPage() {
  const usuarioAtual = useAuthStore(
    (state) => state.usuarioAtual,
  )

  const [busca, setBusca] = useState('')

  const alunosVinculados = useMemo(() => {
    if (!usuarioAtual) return []

    const atendimentos = obterAtendimentosPorProfissional(
      usuarioAtual.refId,
    )

    const idsAlunos = new Set(
      atendimentos
        .filter((item) => item.type === 'personal')
        .map((item) => item.alunoId),
    )

    return obterAlunos().filter((aluno) =>
      idsAlunos.has(aluno.id),
    )
  }, [usuarioAtual])

  const avaliacoes = useMemo(() => {
    const idsAlunos = new Set(
      alunosVinculados.map((aluno) => aluno.id),
    )

    return obterAvaliacoesFisicas()
      .filter((avaliacao) => idsAlunos.has(avaliacao.alunoId))
      .sort((a, b) =>
        b.assessmentDate.localeCompare(a.assessmentDate),
      )
  }, [alunosVinculados])

  const avaliacoesFiltradas = avaliacoes.filter((avaliacao) => {
    const aluno = alunosVinculados.find(
      (item) => item.id === avaliacao.alunoId,
    )

    return aluno?.fullName
      .toLowerCase()
      .includes(busca.toLowerCase())
  })

  function formatarData(data: string) {
    return new Date(`${data}T12:00:00`).toLocaleDateString(
      'pt-BR',
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Área profissional
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Avaliações físicas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulte as avaliações físicas dos alunos vinculados a você.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <ClipboardList
                  className="text-emerald-700"
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Avaliações registradas
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {avaliacoes.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <UserRound
                  className="text-emerald-700"
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Alunos com avaliação
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {
                    new Set(
                      avaliacoes.map((item) => item.alunoId),
                    ).size
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">
              Histórico de avaliações
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Encontre um aluno e consulte os dados registrados.
            </p>
          </div>

          <div className="relative mb-5">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar pelo nome do aluno..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {avaliacoesFiltradas.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList
                className="mx-auto mb-3 text-slate-300"
                size={36}
              />

              <p className="font-medium text-slate-700">
                Nenhuma avaliação encontrada
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {busca
                  ? 'Tente pesquisar por outro nome.'
                  : 'Os alunos vinculados ainda não possuem avaliações registradas.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {avaliacoesFiltradas.map((avaliacao) => {
                const aluno = alunosVinculados.find(
                  (item) => item.id === avaliacao.alunoId,
                )

                if (!aluno) return null

                return (
                  <div
                    key={avaliacao.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {aluno.fullName}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatarData(avaliacao.assessmentDate)}
                        </span>

                        <span>
                          Peso: {avaliacao.weight} kg
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold ${avaliacao.tipo === 'principal' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {avaliacao.tipo === 'principal' ? 'Principal' : 'Mensal'}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Objetivo: {avaliacao.objective}
                      </p>
                    </div>

                    <Link
                      to={`/profissional/alunos/${aluno.id}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Consultar avaliação
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
