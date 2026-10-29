import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { useAuthStore } from '../../store/authStore'
import wavingHand from '../../assets/waving-hand-3d.png'

const OPCOES_FILTRO = [
  { id: 'em-dia', label: 'Em dia' },
  { id: 'atrasado', label: 'Atrasado' },
  { id: 'vence-hoje', label: 'Vence hoje' },
  { id: 'vence-semana', label: 'Vence essa semana' },
]

const COLUNAS_TABELA = ['Nome', 'Matrícula', 'Situação', 'Pagamento', 'Vencimento']

const ITENS_POR_PAGINA = 11

const ALUNOS_MOCK = [
  { nome: 'Ana Beatriz Souza', matricula: '00123', situacao: 'Ativo', pagamento: 'Pago', vencimento: '05/11/2026' },
  { nome: 'Carlos Eduardo Lima', matricula: '00124', situacao: 'Ativo', pagamento: 'Atrasado', vencimento: '28/10/2026' },
  { nome: 'Fernanda Oliveira', matricula: '00125', situacao: 'Inativo', pagamento: 'Pago', vencimento: '12/11/2026' },
  { nome: 'Gabriel Santos', matricula: '00126', situacao: 'Ativo', pagamento: 'Pago', vencimento: '30/10/2026' },
  { nome: 'Juliana Costa', matricula: '00127', situacao: 'Ativo', pagamento: 'Atrasado', vencimento: '20/10/2026' },
  { nome: 'Marcos Pereira', matricula: '00128', situacao: 'Ativo', pagamento: 'Pago', vencimento: '08/11/2026' },
  { nome: 'Patrícia Almeida', matricula: '00129', situacao: 'Ativo', pagamento: 'Pago', vencimento: '26/10/2026' },
]

export function AttendantDashboardPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const [focado, setFocado] = useState(false)
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([])
  const [termoBusca, setTermoBusca] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)

  function alternarFiltro(id: string) {
    setFiltrosAtivos((atuais) =>
      atuais.includes(id) ? atuais.filter((filtro) => filtro !== id) : [...atuais, id],
    )
  }

  function parseDataBr(data: string): Date {
    const [dia, mes, ano] = data.split('/').map(Number)
    return new Date(ano, mes - 1, dia)
  }

  function diasAteVencimento(vencimento: string): number {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataVencimento = parseDataBr(vencimento)
    return Math.round((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  function correspondeAoFiltro(aluno: (typeof ALUNOS_MOCK)[number], filtroId: string): boolean {
    switch (filtroId) {
      case 'em-dia':
        return aluno.pagamento === 'Pago'
      case 'atrasado':
        return aluno.pagamento === 'Atrasado'
      case 'vence-hoje':
        return diasAteVencimento(aluno.vencimento) === 0
      case 'vence-semana': {
        const dias = diasAteVencimento(aluno.vencimento)
        return dias >= 0 && dias <= 7
      }
      default:
        return true
    }
  }

  const termo = termoBusca.trim().toLowerCase()
  const alunosFiltrados = ALUNOS_MOCK.filter((aluno) => {
    const correspondeABusca = termo === '' || aluno.nome.toLowerCase().includes(termo) || aluno.matricula.includes(termo)
    const correspondeAosFiltros =
      filtrosAtivos.length === 0 || filtrosAtivos.some((filtroId) => correspondeAoFiltro(aluno, filtroId))
    return correspondeABusca && correspondeAosFiltros
  })

  useEffect(() => {
    setPaginaAtual(1)
  }, [termo, filtrosAtivos.join(',')])

  const totalPaginas = Math.max(1, Math.ceil(alunosFiltrados.length / ITENS_POR_PAGINA))
  const paginaSegura = Math.min(paginaAtual, totalPaginas)
  const alunosPagina = alunosFiltrados.slice(
    (paginaSegura - 1) * ITENS_POR_PAGINA,
    paginaSegura * ITENS_POR_PAGINA,
  )

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={wavingHand} alt="" className="h-14 w-14" />
          <div>
            <h1 className="text-2xl font-bold">Boas-Vindas, {usuarioAtual?.nome}!</h1>
            <p className="text-base text-slate-500">O que temos para hoje?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {OPCOES_FILTRO.map((opcao) => {
            const ativo = filtrosAtivos.includes(opcao.id)
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => alternarFiltro(opcao.id)}
                className={`whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                  ativo
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-500 hover:border-slate-400'
                }`}
              >
                {opcao.label}
              </button>
            )
          })}

          <div className="relative w-48 transition-all duration-300 ease-out focus-within:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={termoBusca}
              onChange={(evento) => setTermoBusca(evento.target.value)}
              placeholder={focado ? 'Aluno, matrícula ou vencimento' : ''}
              onFocus={() => setFocado(true)}
              onBlur={() => setFocado(false)}
              className="w-full rounded-full border-2 border-slate-400 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-all duration-300 ease-out focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-5 divide-x divide-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {COLUNAS_TABELA.map((coluna) => (
            <span key={coluna} className="px-4 py-3">
              {coluna}
            </span>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-slate-200 bg-slate-50/35">
          {alunosFiltrados.length === 0 && (
            <div className="flex h-12 items-center justify-center text-sm text-slate-500">
              {termo !== ''
                ? `Nenhum aluno encontrado para "${termoBusca}".`
                : 'Nenhum aluno encontrado com os filtros selecionados.'}
            </div>
          )}

          {Array.from({ length: ITENS_POR_PAGINA }).map((_, indice) => {
            const aluno = alunosPagina[indice]

            if (!aluno) {
              return (
                <div key={`vazia-${indice}`} className="grid h-12 grid-cols-5 divide-x divide-slate-200">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )
            }

            return (
              <div key={aluno.matricula} className="grid h-12 grid-cols-5 divide-x divide-slate-200 text-sm text-slate-700">
                <span className="flex items-center px-4">{aluno.nome}</span>
                <span className="flex items-center px-4">{aluno.matricula}</span>
                <span className="flex items-center px-4">{aluno.situacao}</span>
                <span
                  className={`flex items-center px-4 ${
                    aluno.pagamento === 'Atrasado' ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {aluno.pagamento}
                </span>
                <span className="flex items-center px-4">{aluno.vencimento}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 text-sm text-slate-600">
        <span>
          Página {paginaSegura} de {totalPaginas}
        </span>
        <button
          type="button"
          disabled={paginaSegura <= 1}
          onClick={() => setPaginaAtual((pagina) => pagina - 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-slate-400"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={paginaSegura >= totalPaginas}
          onClick={() => setPaginaAtual((pagina) => pagina + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-slate-400"
        >
          Próximo
        </button>
      </div>
    </AppLayout>
  )
}
