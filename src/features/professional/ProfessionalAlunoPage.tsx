
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Save,
  UserRound,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Button, Card } from '../../components/common'
import {
  obterAlunoPorId,
  obterAtendimentosPorAluno,
  obterAvaliacoesPorAluno,
  obterUltimaAvaliacaoPorAluno,
  registrarAvaliacaoFisica,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { AvaliacaoFisica } from '../../types'

const hoje = () => new Date().toISOString().slice(0, 10)

const avaliacaoVazia = (alunoId: string): AvaliacaoFisica => ({
  id: '',
  tipo: 'principal',
  alunoId,
  objective: '',
  description: '',
  notes: '',
  assessmentDate: hoje(),
  weight: 0,
  measurements: {
    peito: 0,
    braco: 0,
    cintura: 0,
    quadril: 0,
    coxa: 0,
  },
})

export function ProfessionalAlunoPage() {
  const { alunoId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const somenteAvaliacao = (
    location.state as { somenteAvaliacao?: boolean } | null
  )?.somenteAvaliacao === true

  const usuarioAtual = useAuthStore(
    (state) => state.usuarioAtual,
  )

  // Cadastro é só leitura aqui: quem edita dados do aluno é o atendente.
  const dadosAluno = obterAlunoPorId(alunoId) ?? null

  const [avaliacao, setAvaliacao] = useState<AvaliacaoFisica>(
    () => obterUltimaAvaliacaoPorAluno(alunoId) ?? avaliacaoVazia(alunoId),
  )

  const [editando, setEditando] = useState(
    () => !obterUltimaAvaliacaoPorAluno(alunoId),
  )

  const [temAvaliacao, setTemAvaliacao] = useState(
    () => Boolean(obterUltimaAvaliacaoPorAluno(alunoId)),
  )

  const [historico, setHistorico] = useState<AvaliacaoFisica[]>(
    () => obterAvaliacoesPorAluno(alunoId),
  )
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const aluno = obterAlunoPorId(alunoId)

  const autorizado = Boolean(
    usuarioAtual &&
      obterAtendimentosPorAluno(alunoId).some(
        (atendimento) =>
          atendimento.type === 'personal' &&
          atendimento.profissionalId === usuarioAtual.refId,
      ),
  )

  useEffect(() => {
    const avaliacaoAtual = obterUltimaAvaliacaoPorAluno(alunoId)

    setHistorico(obterAvaliacoesPorAluno(alunoId))
    setAvaliacao(avaliacaoAtual ?? avaliacaoVazia(alunoId))
    setEditando(!avaliacaoAtual)
    setTemAvaliacao(Boolean(avaliacaoAtual))
    setMensagem('')
    setErro('')
  }, [alunoId])

  const medidas = useMemo(
    () => Object.entries(avaliacao.measurements),
    [avaliacao.measurements],
  )

  if (!aluno || !autorizado || !dadosAluno) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-xl py-16 text-center">
          <UserRound
            className="mx-auto mb-3 text-slate-300"
            size={40}
          />

          <h1 className="text-xl font-semibold text-slate-800">
            Aluno não disponível
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Este aluno não possui vínculo personal com seu perfil profissional.
          </p>

          <Link
            to="/profissional"
            className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
          >
            Voltar para meus alunos
          </Link>
        </div>
      </AppLayout>
    )
  }

  function atualizarMedida(nome: string, valor: number) {
    setAvaliacao((atual) => ({
      ...atual,
      measurements: {
        ...atual.measurements,
        [nome]: valor,
      },
    }))
  }

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErro('')
    setMensagem('')

    if (
      !avaliacao.objective.trim() ||
      !avaliacao.description.trim() ||
      avaliacao.weight <= 0
    ) {
      setErro(
        'Preencha o objetivo, a descrição e um peso válido.',
      )
      return
    }

    try {
      // Sempre cria um registro novo; o tipo (principal/mensal) é decidido no repositório.
      const { id: _id, tipo: _tipo, ...dados } = avaliacao
      const registrada = registrarAvaliacaoFisica({ ...dados, alunoId })

      setAvaliacao(registrada)
      setHistorico(obterAvaliacoesPorAluno(alunoId))
      setTemAvaliacao(true)
      setEditando(false)
      setMensagem(`Avaliação ${registrada.tipo === 'principal' ? 'principal' : 'mensal'} registrada com sucesso.`)
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a avaliação.',
      )
    }
  }

  function cancelarAvaliacao() {
    const salva = obterUltimaAvaliacaoPorAluno(alunoId)

    if (temAvaliacao && salva) {
      setAvaliacao(salva)
      setEditando(false)
    } else {
      navigate('/profissional')
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">

        {somenteAvaliacao ? (
          <div>
            <Link
              to="/profissional/alunos"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Voltar para meus alunos
            </Link>

            <div className="mt-4">
              <p className="text-sm font-medium text-emerald-700">
                Área profissional
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Avaliação física
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Registro e acompanhamento da avaliação física.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Link
              to="/profissional"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
            >
              <ArrowLeft size={16} />
              Voltar para meus alunos
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Perfil do aluno
                </p>

                <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900">
                  {dadosAluno.fullName}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Informações cadastrais e avaliação física.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Vínculo personal ativo
              </span>
            </div>
          </div>
        )}

        {!somenteAvaliacao && (
          <Card>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">
                Informações do aluno
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  label="Nome completo"
                  value={dadosAluno.fullName}
                />

                <Info
                  label="CPF"
                  value={dadosAluno.cpf}
                />

                <Info
                  label="Telefone"
                  value={dadosAluno.phone}
                />

                <Info
                  label="Data de nascimento"
                  value={new Date(
                    `${dadosAluno.birthDate}T12:00:00`,
                  ).toLocaleDateString('pt-BR')}
                />

                <Info
                  label="Altura"
                  value={`${(dadosAluno.height / 100).toFixed(2).replace('.', ',')} m`}
                />

                <Info
                  label="Peso cadastrado"
                  value={`${dadosAluno.weight} kg`}
                />

                <Info
                  label="Início na academia"
                  value={new Date(
                    `${dadosAluno.startDate}T12:00:00`,
                  ).toLocaleDateString('pt-BR')}
                />

                <Info
                  label="Endereço"
                  value={dadosAluno.address}
                />

                <Info
                  label="Status"
                  value={
                    dadosAluno.status === 'active'
                      ? 'Ativo'
                      : dadosAluno.status
                  }
                />
            </div>

            {dadosAluno.notes && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">
                  Observações do cadastro
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {dadosAluno.notes}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Avaliação física */}
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList
                className="text-emerald-700"
                size={20}
              />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Avaliação física
                </h2>

                <p className="text-xs text-slate-500">
                  {temAvaliacao && !editando
                    ? `Exibindo a avaliação ${avaliacao.tipo} de ${new Date(`${avaliacao.assessmentDate}T12:00:00`).toLocaleDateString('pt-BR')}`
                    : temAvaliacao
                      ? 'Nova avaliação mensal (acompanhamento)'
                      : 'Primeira avaliação: será a principal (referência)'}
                </p>
              </div>
            </div>

            {!editando && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMensagem('')
                  setErro('')
                  // Nova avaliação parte das mesmas medidas, zeradas.
                  setAvaliacao({
                    ...avaliacaoVazia(alunoId),
                    objective: avaliacao.objective,
                    measurements: Object.fromEntries(
                      Object.keys(avaliacao.measurements).map((nome) => [nome, 0]),
                    ),
                  })
                  setEditando(true)
                }}
              >
                <Plus size={15} />
                Nova avaliação
              </Button>
            )}
          </div>

          {mensagem && (
            <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {mensagem}
            </p>
          )}

          {erro && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}

          {editando ? (
            <form
              onSubmit={salvar}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  label="Objetivo"
                  value={avaliacao.objective}
                  onChange={(value) =>
                    setAvaliacao((atual) => ({
                      ...atual,
                      objective: value,
                    }))
                  }
                  placeholder="Ex.: Condicionamento físico"
                />

                <Campo
                  label="Data da avaliação"
                  type="date"
                  value={avaliacao.assessmentDate}
                  onChange={(value) =>
                    setAvaliacao((atual) => ({
                      ...atual,
                      assessmentDate: value,
                    }))
                  }
                />

                <Campo
                  label="Peso (kg)"
                  type="number"
                  value={String(avaliacao.weight || '')}
                  onChange={(value) =>
                    setAvaliacao((atual) => ({
                      ...atual,
                      weight: Number(value),
                    }))
                  }
                  placeholder="Ex.: 72,5"
                  step="0.1"
                />
              </div>

              <Campo
                label="Descrição da avaliação"
                value={avaliacao.description}
                onChange={(value) =>
                  setAvaliacao((atual) => ({
                    ...atual,
                    description: value,
                  }))
                }
                placeholder="Descreva as condições e observações da avaliação"
                multiline
              />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Medidas corporais (cm)
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {medidas.map(([nome, valor]) => (
                    <Campo
                      key={nome}
                      label={
                        nome.charAt(0).toUpperCase() + nome.slice(1)
                      }
                      type="number"
                      value={String(valor)}
                      onChange={(value) =>
                        atualizarMedida(nome, Number(value))
                      }
                      step="0.1"
                    />
                  ))}
                </div>
              </div>

              <Campo
                label="Observações adicionais"
                value={avaliacao.notes}
                onChange={(value) =>
                  setAvaliacao((atual) => ({
                    ...atual,
                    notes: value,
                  }))
                }
                placeholder="Anotações do profissional"
                multiline
              />

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelarAvaliacao}
                >
                  Cancelar
                </Button>

                <Button type="submit">
                  <Save size={16} />
                  Salvar avaliação
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Info
                  label="Objetivo"
                  value={avaliacao.objective}
                />

                <Info
                  label="Data"
                  value={new Date(
                    `${avaliacao.assessmentDate}T12:00:00`,
                  ).toLocaleDateString('pt-BR')}
                />

                <Info
                  label="Peso"
                  value={`${avaliacao.weight} kg`}
                />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Descrição
                </p>

                <p className="text-sm text-slate-700">
                  {avaliacao.description}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Medidas corporais
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {medidas.map(([nome, valor]) => (
                    <div
                      key={nome}
                      className="rounded-lg bg-slate-50 p-3"
                    >
                      <p className="text-xs capitalize text-slate-500">
                        {nome}
                      </p>

                      <p className="mt-1 text-lg font-semibold text-slate-800">
                        {valor} cm
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {avaliacao.notes && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Observações
                  </p>

                  <p className="text-sm text-slate-700">
                    {avaliacao.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {historico.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Histórico de avaliações
              </p>
              <ul className="space-y-2">
                {historico.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAvaliacao(item)
                        setEditando(false)
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${item.id === avaliacao.id ? 'bg-slate-50' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.tipo === 'principal' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {item.tipo === 'principal' ? 'Principal' : 'Mensal'}
                        </span>
                        {new Date(`${item.assessmentDate}T12:00:00`).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="font-semibold text-slate-700">{item.weight} kg</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || 'Não informado'}
      </p>
    </div>
  )
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  step?: string
  multiline?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      )}
    </label>
  )
}
