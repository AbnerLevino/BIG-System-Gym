// RF-ATD-09/10/11: tudo do aluno num lugar só (dados pessoais, plano, pagamento e
// matrícula), com edição e cancelamento a partir daqui. Também é onde o atendente
// completa o Face ID de quem foi cadastrado sem rosto (RF-ATD-03 é opcional).
// Aparece dentro de um modal no dashboard do atendente (AttendantDashboardPage).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Pencil, ScanFace, UserX } from 'lucide-react'
import { Button, Card, Input, Modal } from '../../components/common'
import {
  buscarUsuarioPorRefId,
  cancelarMatricula,
  obterAlunoPorId,
  obterHistoricoDePagamentosDoAluno,
  obterHistoricoPlanosPorAluno,
  obterPagamentoReferenciaDoAluno,
  obterPlanoPorId,
  obterPlanos,
  salvarAluno,
  salvarEdicaoDoAluno,
} from '../../data'
import type { Aluno, StatusAluno, StatusPagamento } from '../../types'
import { ConsentimentoBiometria } from './ConsentimentoBiometria'
import { ConviteAtivacaoPainel } from './ConviteAtivacaoPainel'
import { FaceIdPreview } from './FaceIdPreview'

const LABEL_SITUACAO: Record<StatusAluno, string> = {
  active: 'Ativa',
  trial: 'Visita teste',
  cancelled: 'Cancelada',
}

const COR_SITUACAO: Record<StatusAluno, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  trial: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500',
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

function formatarDataBr(data: string | null): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function Linha({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{valor}</span>
    </div>
  )
}

interface AlunoDetalheProps {
  alunoId: string
  // Avisa o dashboard pra reler a lista depois de editar/cancelar/cadastrar rosto.
  onAlterado: () => void
}

export function AlunoDetalhe({ alunoId, onAlterado }: AlunoDetalheProps) {
  const navigate = useNavigate()
  const planos = obterPlanos()

  const [aluno, setAluno] = useState<Aluno | undefined>(() => obterAlunoPorId(alunoId))
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState<Aluno | null>(null)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [capturandoRosto, setCapturandoRosto] = useState(false)
  const [consentiuBiometria, setConsentiuBiometria] = useState(false)
  const [erroRosto, setErroRosto] = useState('')
  const [mensagem, setMensagem] = useState('')

  if (!aluno) {
    return <p className="text-sm text-slate-600">Aluno nao encontrado.</p>
  }

  const recarregar = () => {
    setAluno(obterAlunoPorId(alunoId))
    onAlterado()
  }
  const usuario = buscarUsuarioPorRefId(aluno.id)
  const email = usuario?.email
  const plano = aluno.planoAtualId ? obterPlanoPorId(aluno.planoAtualId) : undefined
  const pagamentoAtual = obterPagamentoReferenciaDoAluno(aluno.id)
  const pagamentos = obterHistoricoDePagamentosDoAluno(aluno.id)
  const historicoPlanos = obterHistoricoPlanosPorAluno(aluno.id).sort((a, b) => b.startDate.localeCompare(a.startDate))
  const cancelado = aluno.status === 'cancelled'

  function iniciarEdicao() {
    setRascunho({ ...aluno! })
    setEditando(true)
    setMensagem('')
  }

  function atualizarRascunho<K extends keyof Aluno>(campo: K, valor: Aluno[K]) {
    setRascunho((atual) => (atual ? { ...atual, [campo]: valor } : atual))
  }

  function handleSalvarEdicao(event: React.FormEvent) {
    event.preventDefault()
    if (!rascunho) return
    salvarEdicaoDoAluno(rascunho)
    recarregar()
    setEditando(false)
    setRascunho(null)
    setMensagem('Dados atualizados.')
  }

  function handleConfirmarCancelamento() {
    cancelarMatricula(aluno!.id)
    recarregar()
    setConfirmandoCancelamento(false)
    setMensagem('Matricula cancelada. O acesso do aluno (check-in e login) foi bloqueado a partir de hoje.')
  }

  function handleCapturarRosto(captura: { descriptor: number[]; photoUrl: string } | null) {
    if (!captura) {
      setErroRosto('Nenhum rosto detectado. Tente novamente com boa iluminacao.')
      return
    }
    salvarAluno({ ...aluno!, faceDescriptor: captura.descriptor, photoUrl: captura.photoUrl })
    recarregar()
    setCapturandoRosto(false)
    setConsentiuBiometria(false)
    setErroRosto('')
    setMensagem('Rosto cadastrado para o check-in.')
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {aluno.photoUrl ? (
              <img src={aluno.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
                {aluno.fullName.charAt(0)}
              </span>
            )}
            <div>
              <p className="text-xl font-bold text-slate-900">{aluno.fullName}</p>
              <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COR_SITUACAO[aluno.status]}`}>
                Matricula {LABEL_SITUACAO[aluno.status]}
              </span>
            </div>
          </div>
          {!editando ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={iniciarEdicao}>
                <Pencil size={14} /> Editar
              </Button>
              {!cancelado ? (
                <Button variant="danger" onClick={() => setConfirmandoCancelamento(true)}>
                  <UserX size={14} /> Cancelar matricula
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {mensagem ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{mensagem}</p>
        ) : null}

        {editando && rascunho ? (
          <form onSubmit={handleSalvarEdicao} className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card title="Dados pessoais">
              <div className="flex flex-col gap-4">
                <Input id="fullName" label="Nome completo" value={rascunho.fullName} onChange={(e) => atualizarRascunho('fullName', e.target.value)} required />
                {/* RF-ATD-10: CPF é identificador imutável — aparece, mas não edita. */}
                <Input id="cpf" label="CPF (nao editavel)" value={rascunho.cpf} disabled className="bg-slate-100 text-slate-500" />
                <Input id="phone" label="Telefone" value={rascunho.phone} onChange={(e) => atualizarRascunho('phone', e.target.value)} required />
                <Input id="address" label="Endereco" value={rascunho.address} onChange={(e) => atualizarRascunho('address', e.target.value)} />
                <Input id="birthDate" label="Data de nascimento" type="date" value={rascunho.birthDate} onChange={(e) => atualizarRascunho('birthDate', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="weight" label="Peso (kg)" type="number" min={0} step="0.1" value={rascunho.weight || ''} onChange={(e) => atualizarRascunho('weight', Number(e.target.value))} />
                  <Input id="height" label="Altura (cm)" type="number" min={0} value={rascunho.height || ''} onChange={(e) => atualizarRascunho('height', Number(e.target.value))} />
                </div>
                <Input id="notes" label="Observacoes" value={rascunho.notes} onChange={(e) => atualizarRascunho('notes', e.target.value)} />
              </div>
            </Card>

            <Card title="Plano">
              <div className="grid gap-3 sm:grid-cols-2">
                {planos.map((item) => {
                  const selecionado = rascunho.planoAtualId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => atualizarRascunho('planoAtualId', item.id)}
                      className={`relative flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors ${
                        selecionado ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {selecionado ? (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
                          <Check size={12} />
                        </span>
                      ) : null}
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xl font-bold text-emerald-700">R$ {item.price.toFixed(2)}</p>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Trocar o plano fica registrado no historico. Pagamentos ja gerados nao mudam de valor.
              </p>
            </Card>

            <div className="flex gap-2 lg:col-span-2">
              <Button type="submit">Salvar alteracoes</Button>
              <Button type="button" variant="secondary" onClick={() => setEditando(false)}>
                Descartar
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card title="Dados pessoais">
              <Linha label="CPF" valor={aluno.cpf} />
              <Linha label="E-mail de acesso" valor={email ?? 'Sem login (visita teste)'} />
              <Linha label="Telefone" valor={aluno.phone} />
              <Linha label="Endereco" valor={aluno.address || '—'} />
              <Linha label="Nascimento" valor={formatarDataBr(aluno.birthDate || null)} />
              <Linha label="Peso / altura" valor={`${aluno.weight ? `${aluno.weight} kg` : '—'} / ${aluno.height ? `${aluno.height} cm` : '—'}`} />
              {aluno.notes ? <Linha label="Observacoes" valor={aluno.notes} /> : null}
            </Card>

            <Card title="Plano e matricula">
              <Linha label="Plano atual" valor={plano ? `${plano.name} — R$ ${plano.price.toFixed(2)}` : 'Sem plano'} />
              <Linha label="Inicio da matricula" valor={formatarDataBr(aluno.startDate)} />
              <Linha label="Situacao da matricula" valor={LABEL_SITUACAO[aluno.status]} />
              <Linha
                label="Situacao do pagamento"
                valor={
                  pagamentoAtual ? (
                    <span className={COR_PAGAMENTO[pagamentoAtual.status]}>
                      {LABEL_PAGAMENTO[pagamentoAtual.status]} · venc. {formatarDataBr(pagamentoAtual.dueDate)}
                    </span>
                  ) : (
                    'Sem cobranca'
                  )
                }
              />
              {pagamentoAtual && pagamentoAtual.status !== 'paid' && !cancelado ? (
                <Button className="mt-3" onClick={() => navigate(`/atendente/pagamento/${aluno.id}`)}>
                  Receber pagamento no balcao
                </Button>
              ) : null}
              {historicoPlanos.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Historico de planos</p>
                  <ul className="mt-1 text-sm text-slate-600">
                    {historicoPlanos.map((historico) => (
                      <li key={historico.id}>
                        {obterPlanoPorId(historico.planoId)?.name ?? historico.planoId}: {formatarDataBr(historico.startDate)} →{' '}
                        {historico.endDate ? formatarDataBr(historico.endDate) : 'atual'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>

            <Card title="Pagamentos">
              {pagamentos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma cobranca registrada.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-sm">
                  {pagamentos.map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between py-2">
                      <span className="text-slate-600">Venc. {formatarDataBr(pagamento.dueDate)}</span>
                      <span className="font-medium">R$ {pagamento.originalValue.toFixed(2)}</span>
                      <span className={`w-24 text-right font-medium ${COR_PAGAMENTO[pagamento.status]}`}>
                        {LABEL_PAGAMENTO[pagamento.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Face ID">
              {aluno.faceDescriptor ? (
                <p className="flex items-center gap-2 text-sm text-emerald-700">
                  <Check size={16} /> Rosto cadastrado para o check-in.
                </p>
              ) : (
                <>
                  <p className="text-sm text-slate-600">Rosto ainda nao cadastrado — o aluno nao consegue fazer check-in por Face ID.</p>
                  {!cancelado ? (
                    <Button className="mt-3" variant="secondary" onClick={() => setCapturandoRosto(true)}>
                      <ScanFace size={14} /> Cadastrar rosto agora
                    </Button>
                  ) : null}
                </>
              )}
            </Card>

            {usuario && !cancelado ? (
              <div className="lg:col-span-2">
                <Card title="Acesso ao app">
                  <ConviteAtivacaoPainel usuarioId={usuario.id} onAlterado={recarregar} />
                </Card>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <Modal open={confirmandoCancelamento} title="Cancelar matricula" onClose={() => setConfirmandoCancelamento(false)}>
        <p className="text-sm text-slate-600">
          Cancelar a matricula de <strong>{aluno.fullName}</strong>? A partir de hoje o aluno fica sem acesso: o check-in
          e o login no sistema passam a ser bloqueados.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmandoCancelamento(false)}>
            Voltar
          </Button>
          <Button variant="danger" onClick={handleConfirmarCancelamento}>
            Confirmar cancelamento
          </Button>
        </div>
      </Modal>

      <Modal
        open={capturandoRosto}
        title="Cadastrar rosto"
        size="lg"
        onClose={() => {
          setCapturandoRosto(false)
          setConsentiuBiometria(false)
          setErroRosto('')
        }}
      >
        <ConsentimentoBiometria nomeAluno={aluno.fullName} consentiu={consentiuBiometria} onAlterar={setConsentiuBiometria} />
        {consentiuBiometria ? (
          <div className="mt-4 flex flex-col items-center gap-3">
            <FaceIdPreview onCapturar={handleCapturarRosto} rotulo="Cadastrar rosto" />
            {erroRosto ? <p className="text-sm text-red-600">{erroRosto}</p> : null}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
