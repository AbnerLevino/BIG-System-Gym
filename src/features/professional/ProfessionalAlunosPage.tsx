
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ClipboardList,
  Dumbbell,
  Search,
  Users,
  X,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'
import {
  obterAlunos,
  obterAtendimentosPorProfissional,
  obterAvaliacoesFisicas,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { Aluno } from '../../types'

export function ProfessionalAlunosPage() {
  const navigate = useNavigate()

  const usuarioAtual = useAuthStore(
    (state) => state.usuarioAtual,
  )

  const [busca, setBusca] = useState('')
  const [mostrarSelecao, setMostrarSelecao] = useState(false)
  const [alunoSelecionado, setAlunoSelecionado] = useState('')

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

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.toLowerCase()

    return (
      aluno.fullName.toLowerCase().includes(termo) ||
      aluno.cpf.includes(busca)
    )
  })

  function abrirAvaliacao() {
    if (!alunoSelecionado) return

    navigate(`/profissional/alunos/${alunoSelecionado}`, {
      state: { somenteAvaliacao: true },
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Área profissional
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Meus alunos
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Consulte os alunos que possuem vínculo personal com você.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarSelecao(true)}
            disabled={alunos.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ClipboardList size={18} />
            Criar nova avaliação
          </button>
        </header>

        {mostrarSelecao && (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Selecionar aluno
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Escolha o aluno para acessar a avaliação física.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarSelecao(false)
                  setAlunoSelecionado('')
                }}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar seleção"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <select
                value={alunoSelecionado}
                onChange={(event) =>
                  setAlunoSelecionado(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Selecione um aluno</option>

                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.fullName}
                    {avaliacoes.some(
                      (avaliacao) => avaliacao.alunoId === aluno.id,
                    )
                      ? ' — Avaliação já registrada'
                      : ' — Sem avaliação'}
                  </option>
                ))}
              </select>

              {alunoSelecionado && (
                <p className="text-xs text-slate-500">
                  {avaliacoes.some(
                    (avaliacao) =>
                      avaliacao.alunoId === alunoSelecionado,
                  )
                    ? 'Este aluno já possui uma avaliação. Você poderá consultar ou editar o registro existente.'
                    : 'Este aluno ainda não possui avaliação. O formulário de criação será aberto.'}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarSelecao(false)
                    setAlunoSelecionado('')
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={abrirAvaliacao}
                  disabled={!alunoSelecionado}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Alunos vinculados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {alunos.length} aluno(s) encontrado(s).
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou CPF"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {alunosFiltrados.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {alunosFiltrados.map((aluno) => (
                <AlunoCard
                  key={aluno.id}
                  aluno={aluno}
                  possuiAvaliacao={avaliacoes.some(
                    (avaliacao) => avaliacao.alunoId === aluno.id,
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Users
                className="mx-auto mb-3 text-slate-300"
                size={32}
              />

              <p className="font-medium text-slate-700">
                Nenhum aluno encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Verifique a busca ou os vínculos personal cadastrados.
              </p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

function AlunoCard({
  aluno,
  possuiAvaliacao,
}: {
  aluno: Aluno
  possuiAvaliacao: boolean
}) {
  return (
    <Link
      to={`/profissional/alunos/${aluno.id}`}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
          {aluno.fullName
            .split(' ')
            .slice(0, 2)
            .map((parte) => parte[0])
            .join('')
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-slate-800">
              {aluno.fullName}
            </h3>

            <ArrowUpRight
              size={16}
              className="shrink-0 text-slate-300 transition group-hover:text-emerald-700"
            />
          </div>

          <p className="mt-0.5 text-xs text-slate-500">
            {aluno.phone}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              Personal
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                possuiAvaliacao
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {possuiAvaliacao
                ? 'Avaliação registrada'
                : 'Sem avaliação'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Dumbbell size={14} />
          Ver perfil e avaliação
        </span>

        <span className="font-medium text-emerald-700">
          Acessar
        </span>
      </div>
    </Link>
  )
}
