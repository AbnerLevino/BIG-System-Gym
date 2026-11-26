// "Consultar aluno" da Central da Recepção — RF-ATD-08: busca parcial por nome,
// CPF (com ou sem pontuação) ou e-mail. Escolher um aluno abre a ficha dele.
import { useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Modal } from '../../components/common'
import { buscarUsuarioPorRefId, obterAlunos, obterPagamentoReferenciaDoAluno } from '../../data'
import type { Aluno, Pagamento, StatusAluno, StatusPagamento } from '../../types'
import { somenteDigitos } from '../../utils/validacoes'
import { AvatarAluno } from '../../components/aluno'

const LABEL_SITUACAO: Record<StatusAluno, string> = {
  active: 'Ativo',
  trial: 'Visita teste',
  cancelled: 'Cancelado',
}

const CHIP_SITUACAO: Record<StatusAluno, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const LABEL_PAGAMENTO: Record<StatusPagamento, string> = {
  paid: 'Pago',
  pending: 'Em aberto',
  late: 'Atrasado',
}

const COR_PAGAMENTO: Record<StatusPagamento, string> = {
  paid: 'text-emerald-700',
  pending: 'text-amber-600',
  late: 'text-rose-600',
}

interface ResultadoBusca {
  aluno: Aluno
  email: string
  pagamento: Pagamento | undefined
}

function montarResultados(): ResultadoBusca[] {
  return obterAlunos()
    .map((aluno) => ({
      aluno,
      email: buscarUsuarioPorRefId(aluno.id)?.email ?? '',
      pagamento: obterPagamentoReferenciaDoAluno(aluno.id),
    }))
    .sort((a, b) => a.aluno.fullName.localeCompare(b.aluno.fullName))
}

function correspondeABusca({ aluno, email }: ResultadoBusca, termo: string): boolean {
  if (termo === '') return true
  const termoDigitos = somenteDigitos(termo)
  return (
    aluno.fullName.toLowerCase().includes(termo) ||
    email.toLowerCase().includes(termo) ||
    aluno.cpf.includes(termo) ||
    (termoDigitos.length > 0 && somenteDigitos(aluno.cpf).includes(termoDigitos))
  )
}

interface BuscaAlunoModalProps {
  open: boolean
  onClose: () => void
  onSelecionar: (alunoId: string) => void
}

export function BuscaAlunoModal({ open, onClose, onSelecionar }: BuscaAlunoModalProps) {
  const [termoBusca, setTermoBusca] = useState('')
  // Relido a cada abertura, pra refletir cadastros/edições recentes.
  const resultados = open ? montarResultados() : []
  const termo = termoBusca.trim().toLowerCase()
  const filtrados = resultados.filter((resultado) => correspondeABusca(resultado, termo))

  function fechar() {
    setTermoBusca('')
    onClose()
  }

  return (
    <Modal open={open} title="Consultar aluno" size="lg" onClose={fechar}>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          type="text"
          value={termoBusca}
          onChange={(evento) => setTermoBusca(evento.target.value)}
          placeholder="Nome, CPF ou e-mail"
          className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {filtrados.length} {filtrados.length === 1 ? 'aluno' : 'alunos'}
      </p>

      {filtrados.length === 0 ? (
        <div className="mt-2 rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Nenhum aluno encontrado para "{termoBusca}".</p>
          <p className="mt-1 text-xs text-slate-500">Confira a grafia ou busque pelo CPF.</p>
        </div>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {filtrados.map(({ aluno, email, pagamento }) => (
            <li key={aluno.id}>
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('')
                  onSelecionar(aluno.id)
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-emerald-50/60"
              >
                <AvatarAluno aluno={aluno} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{aluno.fullName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {aluno.cpf}
                    {email ? ` · ${email}` : ''}
                  </p>
                </div>
                {pagamento ? (
                  <span className={`hidden text-xs font-medium sm:inline ${COR_PAGAMENTO[pagamento.status]}`}>
                    {LABEL_PAGAMENTO[pagamento.status]}
                  </span>
                ) : null}
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${CHIP_SITUACAO[aluno.status]}`}>
                  {LABEL_SITUACAO[aluno.status]}
                </span>
                <ChevronRight size={16} className="shrink-0 text-slate-300 group-hover:text-emerald-700" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
