
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  X,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'
import {
  obterAlunos,
  obterAtendimentosPorProfissional,
  obterAgendamentosPorProfissional,
  salvarAgendamento,
} from '../../data'
import type { Agendamento } from '../../types/agendamento'
import { useAuthStore } from '../../store/authStore'

type ModoCalendario = 'semana' | 'mes'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const ATIVIDADES = [
  'Treino personalizado',
  'Avaliação física',
  'Acompanhamento',
  'Orientação de treino',
  'Outro compromisso',
]

const dataISO = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`

const inicioSemana = (data: Date) => {
  const inicio = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
  )

  inicio.setDate(inicio.getDate() - inicio.getDay())

  return inicio
}

export function ProfessionalAgendaPage() {
  const usuarioAtual = useAuthStore(
    (state) => state.usuarioAtual,
  )

  const [modo, setModo] = useState<ModoCalendario>('semana')

  const [dataReferencia, setDataReferencia] = useState(
    () => new Date(),
  )

  const [diaSelecionado, setDiaSelecionado] = useState(
    () => dataISO(new Date()),
  )

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    () =>
      usuarioAtual
        ? obterAgendamentosPorProfissional(usuarioAtual.refId)
        : [],
  )

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [alunoId, setAlunoId] = useState('')
  const [horario, setHorario] = useState('')
  const [atividade, setAtividade] = useState(ATIVIDADES[0])
  const [outraAtividade, setOutraAtividade] = useState('')
  const [erro, setErro] = useState('')

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

  const alunosPorId = useMemo(
    () => new Map(alunos.map((aluno) => [aluno.id, aluno])),
    [alunos],
  )

  const agendamentosDoDia = agendamentos
    .filter((item) => item.data === diaSelecionado)
    .sort((a, b) => a.horario.localeCompare(b.horario))

  const diasCalendario = useMemo(() => {
    if (modo === 'semana') {
      const inicio = inicioSemana(dataReferencia)

      return Array.from({ length: 7 }, (_, indice) => {
        const dia = new Date(inicio)
        dia.setDate(inicio.getDate() + indice)
        return dia
      })
    }

    const primeiroDia = new Date(
      dataReferencia.getFullYear(),
      dataReferencia.getMonth(),
      1,
    )

    const inicio = inicioSemana(primeiroDia)

    return Array.from({ length: 42 }, (_, indice) => {
      const dia = new Date(inicio)
      dia.setDate(inicio.getDate() + indice)
      return dia
    })
  }, [dataReferencia, modo])

  function navegarCalendario(direcao: number) {
    const novaData = new Date(dataReferencia)

    if (modo === 'semana') {
      novaData.setDate(novaData.getDate() + direcao * 7)
    } else {
      novaData.setMonth(novaData.getMonth() + direcao)
    }

    setDataReferencia(novaData)
  }

  function nomePeriodo() {
    if (modo === 'mes') {
      return `${MESES[dataReferencia.getMonth()]} ${dataReferencia.getFullYear()}`
    }

    const inicio = inicioSemana(dataReferencia)
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)

    return `${inicio.getDate()} ${MESES[inicio.getMonth()].slice(0, 3)} – ${fim.getDate()} ${MESES[fim.getMonth()].slice(0, 3)} ${fim.getFullYear()}`
  }

  function selecionarDia(chave: string) {
    setDiaSelecionado(chave)
    setMostrarFormulario(true)
    setErro('')
    setAlunoId('')
    setHorario('')
    setAtividade(ATIVIDADES[0])
    setOutraAtividade('')
  }

  function voltarParaHoje() {
    const hoje = new Date()

    setDataReferencia(hoje)
    setDiaSelecionado(dataISO(hoje))
    setMostrarFormulario(false)
  }

  function salvarNovoAgendamento() {
    if (!usuarioAtual) {
      setErro('Não foi possível identificar o profissional conectado.')
      return
    }

    if (!alunoId || !horario) {
      setErro('Selecione um aluno e informe o horário.')
      return
    }

    if (atividade === 'Outro compromisso' && !outraAtividade.trim()) {
      setErro('Informe a descrição do compromisso.')
      return
    }

    const alunoVinculado = alunos.some(
      (aluno) => aluno.id === alunoId,
    )

    if (!alunoVinculado) {
      setErro('O aluno selecionado não está vinculado a você.')
      return
    }

    const novoAgendamento: Agendamento = {
      id: `agendamento-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      alunoId,
      profissionalId: usuarioAtual.refId,
      data: diaSelecionado,
      horario,
      atividade:
        atividade === 'Outro compromisso'
          ? outraAtividade.trim()
          : atividade,
    }

    try {
      salvarAgendamento(novoAgendamento)

      setAgendamentos(
        obterAgendamentosPorProfissional(usuarioAtual.refId),
      )

      setMostrarFormulario(false)
      setAlunoId('')
      setHorario('')
      setAtividade(ATIVIDADES[0])
      setOutraAtividade('')
      setErro('')
    } catch {
      setErro('Não foi possível salvar o compromisso. Tente novamente.')
    }
  }

  const dataFormatada = new Date(
    `${diaSelecionado}T12:00:00`,
  ).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium text-emerald-700">
            Área profissional
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Agenda profissional
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize seus compromissos e atendimentos com os alunos.
          </p>
        </header>

        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays
                  className="text-emerald-700"
                  size={19}
                />

                <h2 className="font-semibold text-slate-800">
                  Calendário de atendimentos
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Clique em um dia para marcar um compromisso.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => setModo('semana')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  modo === 'semana'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Semana
              </button>

              <button
                type="button"
                onClick={() => setModo('mes')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  modo === 'mes'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Mês
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navegarCalendario(-1)}
                  aria-label="Período anterior"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={voltarParaHoje}
                  className="text-xs text-slate-500 hover:text-emerald-700"
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() => navegarCalendario(1)}
                  aria-label="Próximo período"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <ChevronRight size={18} />
                </button>

                <span className="ml-1 text-sm font-semibold text-slate-700">
                  {nomePeriodo()}
                </span>
              </div>

              <span className="hidden text-xs text-slate-400 sm:inline">
                Selecione um dia para agendar
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {DIAS.map((dia) => (
                <div
                  key={dia}
                  className="py-1 text-center text-[11px] font-semibold uppercase text-slate-400"
                >
                  {dia}
                </div>
              ))}

              {diasCalendario.map((dia) => {
                const chave = dataISO(dia)

                const temAgenda = agendamentos.some(
                  (item) => item.data === chave,
                )

                const foraDoMes =
                  dia.getMonth() !== dataReferencia.getMonth()

                const selecionado = chave === diaSelecionado

                return (
                  <button
                    type="button"
                    key={chave}
                    onClick={() => selecionarDia(chave)}
                    aria-label={`Agendar compromisso em ${dia.toLocaleDateString('pt-BR')}`}
                    className={`relative flex min-h-10 flex-col items-center justify-center rounded-lg text-sm transition ${
                      selecionado
                        ? 'bg-emerald-700 font-semibold text-white'
                        : foraDoMes && modo === 'mes'
                          ? 'text-slate-300 hover:bg-slate-50'
                          : 'text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{dia.getDate()}</span>

                    {temAgenda && (
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                          selecionado
                            ? 'bg-white'
                            : 'bg-emerald-500'
                        }`}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold capitalize text-slate-700">
                  {dataFormatada}
                </p>

                <span className="text-xs text-slate-400">
                  {agendamentosDoDia.length} compromisso(s)
                </span>
              </div>

              {mostrarFormulario && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Plus size={18} className="text-emerald-700" />
                      <h3 className="font-semibold text-slate-800">
                        Novo compromisso
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      aria-label="Fechar formulário"
                      className="rounded-md p-1 text-slate-500 hover:bg-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">
                      Aluno
                      <select
                        value={alunoId}
                        onChange={(event) => setAlunoId(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        required
                      >
                        <option value="">Selecione um aluno</option>
                        {alunos.map((aluno) => (
                          <option key={aluno.id} value={aluno.id}>
                            {aluno.fullName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                      Horário
                      <input
                        type="time"
                        value={horario}
                        onChange={(event) => setHorario(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        required
                      />
                    </label>

                    <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                      Tipo de compromisso
                      <select
                        value={atividade}
                        onChange={(event) => setAtividade(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      >
                        {ATIVIDADES.map((opcao) => (
                          <option key={opcao} value={opcao}>
                            {opcao}
                          </option>
                        ))}
                      </select>
                    </label>

                    {atividade === 'Outro compromisso' && (
                      <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Descrição
                        <input
                          type="text"
                          value={outraAtividade}
                          onChange={(event) =>
                            setOutraAtividade(event.target.value)
                          }
                          placeholder="Descreva o compromisso"
                          maxLength={100}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </label>
                    )}
                  </div>

                  {erro && (
                    <p className="mt-3 text-sm text-red-600">
                      {erro}
                    </p>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={salvarNovoAgendamento}
                      disabled={alunos.length === 0}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Salvar compromisso
                    </button>
                  </div>

                  {alunos.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Você ainda não possui alunos com vínculo personal.
                    </p>
                  )}
                </div>
              )}

              {agendamentosDoDia.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {agendamentosDoDia.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <div className="rounded-md bg-white p-2 text-emerald-700">
                        <Clock3 size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/profissional/alunos/${item.alunoId}`}
                          className="truncate text-sm font-medium text-slate-700 hover:text-emerald-700"
                        >
                          {alunosPorId.get(item.alunoId)?.fullName ?? 'Aluno não encontrado'}
                        </Link>

                        <p className="text-xs text-slate-500">
                          {item.atividade}
                        </p>
                      </div>

                      <span className="text-sm font-semibold tabular-nums text-slate-600">
                        {item.horario}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-xs text-slate-400">
                  Nenhum compromisso marcado para este dia.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
