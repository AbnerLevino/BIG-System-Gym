import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
  History,
} from 'lucide-react'

import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

import type { Colaborador } from '../../types/colaborador'

import {
  obterColaboradores,
  salvarColaborador,
  excluirColaborador,
} from '../../data/colaboradorRepository'

type FormularioColaborador = {
  nome: string
  email: string
  telefone: string
  cargo: string
  tipoContrato: string
  dataAdmissao: string
  salario: string
  cref: string
  validadeCref: string
}

const FORMULARIO_INICIAL: FormularioColaborador = {
  nome: '',
  email: '',
  telefone: '',
  cargo: '',
  tipoContrato: '',
  dataAdmissao: '',
  salario: '',
  cref: '',
  validadeCref: '',
}

function formatarData(data: string): string {
  if (!data) return '-'

  const dataFormatada = new Date(`${data}T00:00:00`)

  if (Number.isNaN(dataFormatada.getTime())) {
    return data
  }

  return dataFormatada.toLocaleDateString('pt-BR')
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function AdminFuncionariosPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [busca, setBusca] = useState('')
  const [filtroCargo, setFiltroCargo] = useState('todos')

  const [formularioAberto, setFormularioAberto] = useState(false)
  const [colaboradorEditando, setColaboradorEditando] =
    useState<Colaborador | null>(null)

  const [formulario, setFormulario] =
    useState<FormularioColaborador>(FORMULARIO_INICIAL)

  const [historicoAberto, setHistoricoAberto] =
    useState<Colaborador | null>(null)

  const [erro, setErro] = useState('')

  function carregarColaboradores() {
    setColaboradores(obterColaboradores())
  }

  useEffect(() => {
    carregarColaboradores()
  }, [])

  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter((colaborador) => {
      const correspondeBusca =
        colaborador.nome.toLowerCase().includes(busca.toLowerCase()) ||
        colaborador.email.toLowerCase().includes(busca.toLowerCase())

      const correspondeCargo =
        filtroCargo === 'todos' || colaborador.cargo === filtroCargo

      return correspondeBusca && correspondeCargo
    })
  }, [colaboradores, busca, filtroCargo])

  const cargosDisponiveis = useMemo(() => {
    return Array.from(
      new Set(colaboradores.map((colaborador) => colaborador.cargo)),
    ).sort()
  }, [colaboradores])

  function atualizarCampo(
    campo: keyof FormularioColaborador,
    valor: string,
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function abrirCadastro() {
    setColaboradorEditando(null)
    setFormulario(FORMULARIO_INICIAL)
    setErro('')
    setFormularioAberto(true)
  }

  function abrirEdicao(colaborador: Colaborador) {
    setColaboradorEditando(colaborador)

    setFormulario({
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone,
      cargo: colaborador.cargo,
      tipoContrato: colaborador.tipoContrato,
      dataAdmissao: colaborador.dataAdmissao,
      salario: String(colaborador.salario),
      cref: colaborador.cref,
      validadeCref: colaborador.validadeCref,
    })

    setErro('')
    setFormularioAberto(true)
  }

  function fecharFormulario() {
    setFormularioAberto(false)
    setColaboradorEditando(null)
    setFormulario(FORMULARIO_INICIAL)
    setErro('')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    const salario = Number(formulario.salario.replace(',', '.'))

    if (
      !formulario.nome.trim() ||
      !formulario.email.trim() ||
      !formulario.cargo.trim() ||
      !formulario.tipoContrato.trim() ||
      !formulario.dataAdmissao ||
      !formulario.salario.trim()
    ) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    if (!Number.isFinite(salario) || salario < 0) {
      setErro('Informe um salário válido.')
      return
    }

    try {
      salvarColaborador({
        id: colaboradorEditando?.id,
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        telefone: formulario.telefone.trim(),
        cargo: formulario.cargo.trim(),
        tipoContrato: formulario.tipoContrato.trim(),
        dataAdmissao: formulario.dataAdmissao,
        salario,
        cref: formulario.cref.trim(),
        validadeCref: formulario.validadeCref,
      })

      carregarColaboradores()
      fecharFormulario()
    } catch {
      setErro('Não foi possível salvar o funcionário.')
    }
  }

  function handleExcluir(colaborador: Colaborador) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o cadastro de ${colaborador.nome}?`,
    )

    if (!confirmou) return

    excluirColaborador(colaborador.id)
    carregarColaboradores()

    if (historicoAberto?.id === colaborador.id) {
      setHistoricoAberto(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Funcionários
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre e gerencie os funcionários da academia.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus size={18} />
            Novo funcionário
          </button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card title="Total de funcionários">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">
                  {colaboradores.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Cadastros realizados
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Users size={26} />
              </div>
            </div>
          </Card>

          <Card title="Cargos cadastrados">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">
                  {cargosDisponiveis.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Diferentes cargos
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Users size={26} />
              </div>
            </div>
          </Card>
        </div>

        {/* Formulário */}
        {formularioAberto && (
          <Card
            title={
              colaboradorEditando
                ? 'Editar funcionário'
                : 'Cadastrar funcionário'
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Nome completo *
                  </label>

                  <input
                    type="text"
                    value={formulario.nome}
                    onChange={(event) =>
                      atualizarCampo('nome', event.target.value)
                    }
                    placeholder="Nome do funcionário"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    E-mail *
                  </label>

                  <input
                    type="email"
                    value={formulario.email}
                    onChange={(event) =>
                      atualizarCampo('email', event.target.value)
                    }
                    placeholder="email@exemplo.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Telefone
                  </label>

                  <input
                    type="tel"
                    value={formulario.telefone}
                    onChange={(event) =>
                      atualizarCampo('telefone', event.target.value)
                    }
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Cargo *
                  </label>

                  <select
                    value={formulario.cargo}
                    onChange={(event) =>
                      atualizarCampo('cargo', event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  >
                    <option value="">Selecione o cargo</option>
                    <option value="admin">Gestor</option>
                    <option value="professional">Professor / Personal</option>
                    <option value="attendant">Recepcionista</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tipo de contrato *
                  </label>

                  <input
                    type="text"
                    value={formulario.tipoContrato}
                    onChange={(event) =>
                      atualizarCampo('tipoContrato', event.target.value)
                    }
                    placeholder="Ex.: CLT, PJ, estágio"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Data de admissão *
                  </label>

                  <input
                    type="date"
                    value={formulario.dataAdmissao}
                    onChange={(event) =>
                      atualizarCampo('dataAdmissao', event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Salário (R$) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.salario}
                    onChange={(event) =>
                      atualizarCampo('salario', event.target.value)
                    }
                    placeholder="0,00"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    CREF
                  </label>

                  <input
                    type="text"
                    value={formulario.cref}
                    onChange={(event) =>
                      atualizarCampo('cref', event.target.value)
                    }
                    placeholder="Número do CREF"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Validade do CREF
                  </label>

                  <input
                    type="date"
                    value={formulario.validadeCref}
                    onChange={(event) =>
                      atualizarCampo('validadeCref', event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {erro && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {erro}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={fecharFormulario}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {colaboradorEditando
                    ? 'Salvar alterações'
                    : 'Cadastrar funcionário'}
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Histórico de alterações */}
        {historicoAberto && (
          <Card title={`Histórico de ${historicoAberto.nome}`}>
            <div className="space-y-3">
              {historicoAberto.historicoAlteracoes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma alteração de cargo ou salário registrada.
                </p>
              ) : (
                historicoAberto.historicoAlteracoes.map((alteracao) => (
                  <div
                    key={alteracao.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {alteracao.campo === 'cargo'
                        ? 'Alteração de cargo'
                        : 'Alteração de salário'}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {alteracao.campo === 'salario'
                        ? `${formatarMoeda(Number(alteracao.valorAnterior))} → ${formatarMoeda(Number(alteracao.valorNovo))}`
                        : `${alteracao.valorAnterior} → ${alteracao.valorNovo}`}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(alteracao.data).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setHistoricoAberto(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Fechar histórico
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Pesquisa e filtros */}
        <Card title="Funcionários cadastrados">
          <div className="mb-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <select
              value={filtroCargo}
              onChange={(event) => setFiltroCargo(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
            >
              <option value="todos">Todos os cargos</option>

              {cargosDisponiveis.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
          </div>

          {colaboradoresFiltrados.length === 0 ? (
            <div className="py-10 text-center">
              <Users
                size={36}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-700">
                Nenhum funcionário encontrado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre um funcionário ou altere os filtros da pesquisa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-3 font-semibold">Funcionário</th>
                    <th className="px-3 py-3 font-semibold">Cargo</th>
                    <th className="px-3 py-3 font-semibold">Contrato</th>
                    <th className="px-3 py-3 font-semibold">Admissão</th>
                    <th className="px-3 py-3 font-semibold">Salário</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {colaboradoresFiltrados.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-slate-800">
                          {colaborador.nome}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {colaborador.email}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {colaborador.cargo}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {colaborador.tipoContrato}
                      </td>

                      <td className="px-3 py-4 text-slate-600">
                        {formatarData(colaborador.dataAdmissao)}
                      </td>

                      <td className="px-3 py-4 font-medium text-slate-700">
                        {formatarMoeda(colaborador.salario)}
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Ver histórico"
                            onClick={() =>
                              setHistoricoAberto(colaborador)
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700"
                          >
                            <History size={17} />
                          </button>

                          <button
                            type="button"
                            title="Editar funcionário"
                            onClick={() => abrirEdicao(colaborador)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Excluir funcionário"
                            onClick={() => handleExcluir(colaborador)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              {colaboradoresFiltrados.length} funcionário(s) encontrado(s)
            </p>

            {busca || filtroCargo !== 'todos' ? (
              <button
                type="button"
                onClick={() => {
                  setBusca('')
                  setFiltroCargo('todos')
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                <X size={14} />
                Limpar filtros
              </button>
            ) : null}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}