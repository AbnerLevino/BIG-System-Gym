// Cadastro presencial no balcão, em etapas. Abre num modal da Central da
// Recepção (AttendantDashboardPage), pelo botão "Novo aluno".
// Matrícula:   Dados → Plano → Acesso → Pagamento → Rosto → Convite
// Visita teste: Dados → Rosto → Concluído (sem plano, sem login)
//
// A conta do aluno só nasce quando o pagamento é confirmado (RF-ATD-04), e a
// senha nunca passa pelo atendente: o sistema gera um convite e o próprio aluno
// cria a senha pelo link/QR code (RF-ATD-05/06/07 + RF-ALU-01).
import { useEffect, useState } from 'react'
import { ArrowLeft, Check, MailCheck, UserRound, UsersRound } from 'lucide-react'
import { Alerta, Button, Card, Input, SeletorDdi } from '../../components/common'
import { PagamentoCheckout } from '../../components/payment'
import { CartaoPlano } from '../../components/plano'
import { buscarAlunoPorCpf, buscarUsuarioPorEmail, matricularAluno, obterPlanos, salvarAluno } from '../../data'
import type { Aluno, Pagamento } from '../../types'
import { PAISES_DDI, formatarCpf, formatarTelefone } from '../../utils/mascaras'
import { gerarCpfDeTeste, motivoCpfInvalido } from '../../utils/validacoes'
import { ConsentimentoBiometria } from './ConsentimentoBiometria'
import { ConviteAtivacaoPainel } from './ConviteAtivacaoPainel'
import { FaceIdPreview } from './FaceIdPreview'
import { formatarMoeda } from '../../utils/formatacao'

type Etapa = 'dados' | 'plano' | 'acesso' | 'pagamento' | 'rosto' | 'concluido'

const PASSOS_MATRICULA: { etapa: Etapa; label: string }[] = [
  { etapa: 'dados', label: 'Dados' },
  { etapa: 'plano', label: 'Plano' },
  { etapa: 'acesso', label: 'Acesso' },
  { etapa: 'pagamento', label: 'Pagamento' },
  { etapa: 'rosto', label: 'Rosto' },
  { etapa: 'concluido', label: 'Convite' },
]

const PASSOS_VISITA: { etapa: Etapa; label: string }[] = [
  { etapa: 'dados', label: 'Dados' },
  { etapa: 'rosto', label: 'Rosto' },
  { etapa: 'concluido', label: 'Concluído' },
]

interface Captura {
  descriptor: number[]
  photoUrl: string
}

function IndicadorDePassos({ passos, atual }: { passos: { etapa: Etapa; label: string }[]; atual: Etapa }) {
  const indiceAtual = passos.findIndex((passo) => passo.etapa === atual)

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {passos.map((passo, index) => {
        const concluido = index < indiceAtual
        const ativo = index === indiceAtual
        return (
          <li key={passo.etapa} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                  concluido
                    ? 'bg-emerald-700 text-white'
                    : ativo
                      ? 'border-2 border-emerald-700 text-emerald-700'
                      : 'border border-slate-300 text-slate-400'
                }`}
              >
                {concluido ? <Check size={12} /> : index + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  ativo ? 'text-emerald-700' : concluido ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {passo.label}
              </span>
            </div>
            {index < passos.length - 1 ? <span className="h-px w-5 bg-slate-200" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="truncate text-right font-medium text-slate-900">{valor || '—'}</span>
    </div>
  )
}

function BotaoVoltar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-700"
    >
      <ArrowLeft size={14} /> Voltar
    </button>
  )
}

interface CadastroAlunoFluxoProps {
  // Plano já escolhido (vindo do catálogo de planos).
  planoInicialId?: string | null
  // Avisa se há cadastro em andamento (pra confirmar antes de fechar o modal).
  onEmAndamento: (emAndamento: boolean) => void
  // Algo foi gravado (matrícula/visita) — a Central relê os dados.
  onAlterado: () => void
  onVerFicha: (alunoId: string) => void
  onFechar: () => void
}

export function CadastroAlunoFluxo({ planoInicialId, onEmAndamento, onAlterado, onVerFicha, onFechar }: CadastroAlunoFluxoProps) {
  const planos = obterPlanos()

  const [etapa, setEtapa] = useState<Etapa>('dados')
  const [visitaTeste, setVisitaTeste] = useState(false)
  // Vindo do catálogo de planos (/atendente/planos), o plano já chega escolhido.
  const [planoAtualId, setPlanoAtualId] = useState(() =>
    planoInicialId && planos.some((plano) => plano.id === planoInicialId) ? planoInicialId : '',
  )
  const plano = planos.find((item) => item.id === planoAtualId)

  const [fullName, setFullName] = useState('')
  const [ddi, setDdi] = useState(PAISES_DDI[0].ddi)
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  // Erro do CPF aparece embaixo do campo — depois de sair do campo ou ao enviar.
  const [erroCpf, setErroCpf] = useState('')
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [email, setEmail] = useState('')
  const [emailConferido, setEmailConferido] = useState(false)
  const [consentiuBiometria, setConsentiuBiometria] = useState(false)
  const [rostoCadastrado, setRostoCadastrado] = useState(false)
  const [erro, setErro] = useState('')

  const [alunoId] = useState(() => crypto.randomUUID())
  const [pagamentoPendente, setPagamentoPendente] = useState<Pagamento | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  const passos = visitaTeste ? PASSOS_VISITA : PASSOS_MATRICULA

  // "Em andamento" = já digitou algo e ainda não concluiu. Depois do pagamento a
  // matrícula já está gravada, então fechar não perde nada importante.
  const emAndamento =
    etapa !== 'concluido' && usuarioId === null && (fullName !== '' || cpf !== '' || etapa !== 'dados')
  useEffect(() => {
    onEmAndamento(emAndamento)
  }, [emAndamento, onEmAndamento])
  const hoje = new Date().toISOString().slice(0, 10)

  function irPara(proxima: Etapa) {
    setErro('')
    setEtapa(proxima)
  }

  function montarAluno(captura: Captura | null): Aluno {
    return {
      id: alunoId,
      fullName: fullName.trim(),
      weight: Number(weight) || 0,
      height: Number(height) || 0,
      phone: `${ddi} ${phone}`,
      cpf,
      address,
      birthDate,
      notes: '',
      planoAtualId: visitaTeste ? null : planoAtualId,
      startDate: hoje,
      status: visitaTeste ? 'trial' : 'active',
      ...(captura ? { faceDescriptor: captura.descriptor, photoUrl: captura.photoUrl } : {}),
    }
  }

  // ---------- 1. Dados ----------
  function handleDados(event: React.FormEvent) {
    event.preventDefault()
    // RF-ATD-01: CPF validado (formato + dígito verificador) e sem duplicidade.
    const motivo = validarCampoCpf(cpf)
    if (motivo) {
      setErro('')
      document.getElementById('cpf')?.focus()
      return
    }
    irPara(visitaTeste ? 'rosto' : 'plano')
  }

  function validarCampoCpf(valor: string): string | null {
    const motivo = motivoCpfInvalido(valor) ?? (buscarAlunoPorCpf(valor) ? 'Já existe um aluno cadastrado com este CPF.' : null)
    setErroCpf(motivo ?? '')
    return motivo
  }

  // ---------- 2. Plano ----------
  function handlePlano() {
    if (!plano) {
      setErro('Escolha um plano para continuar.')
      return
    }
    irPara('acesso')
  }

  // ---------- 3. Acesso ----------
  function handleAcesso(event: React.FormEvent) {
    event.preventDefault()
    if (!plano) return
    // RF-ATD-04: e-mail repetido bloqueia ANTES de cobrar.
    if (buscarUsuarioPorEmail(email)) {
      setErro('Este e-mail já está cadastrado no sistema. Use outro e-mail.')
      return
    }
    if (!emailConferido) {
      setErro('Peça para o aluno conferir o e-mail e marque a confirmação.')
      return
    }
    setPagamentoPendente({
      id: crypto.randomUUID(),
      academiaId: 'gym-1',
      alunoId,
      planoId: plano.id,
      originalValue: plano.price,
      paidValue: null,
      lateFee: 0,
      paymentMethod: null,
      dueDate: hoje,
      paymentDate: null,
      status: 'pending',
      receiptNumber: null,
    })
    irPara('pagamento')
  }

  // ---------- 4. Pagamento aprovado → nasce a conta ----------
  function handlePagamentoAprovado() {
    const { usuario } = matricularAluno(montarAluno(null), email)
    setUsuarioId(usuario.id)
    onAlterado()
    irPara('rosto')
  }

  // ---------- 5. Rosto (opcional, RF-ATD-03) ----------
  function concluirRosto(captura: Captura | null) {
    if (visitaTeste) {
      salvarAluno(montarAluno(captura))
    } else if (captura) {
      // Matrícula já foi gravada no pagamento — aqui só completa o rosto.
      salvarAluno(montarAluno(captura))
    }
    setRostoCadastrado(captura !== null)
    onAlterado()
    irPara('concluido')
  }

  function handleCapturar(captura: Captura | null) {
    if (!captura) {
      setErro('Nenhum rosto detectado. Tente novamente com boa iluminacao.')
      return
    }
    concluirRosto(captura)
  }

  const mostrarResumo = !visitaTeste && (etapa === 'plano' || etapa === 'acesso' || etapa === 'pagamento')

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">
            {visitaTeste ? 'Visita teste' : 'Nova matrícula'}
            <span className="font-normal text-slate-500"> · cadastro presencial no balcão</span>
          </p>
          <IndicadorDePassos passos={passos} atual={etapa} />
        </div>

        <div className={`mt-6 grid gap-6 ${mostrarResumo ? 'lg:grid-cols-[1fr_260px]' : ''}`}>
          <div className="min-w-0">
            {/* ---------- 1. Dados ---------- */}
            {etapa === 'dados' ? (
              <form onSubmit={handleDados} className="flex flex-col gap-6">
                <div className="flex w-fit rounded-full bg-zinc-100 p-1 text-sm font-semibold">
                  {[
                    { valor: false, label: 'Matrícula', icon: UserRound },
                    { valor: true, label: 'Visita teste', icon: UsersRound },
                  ].map((opcao) => {
                    const Icone = opcao.icon
                    const ativo = visitaTeste === opcao.valor
                    return (
                      <button
                        key={opcao.label}
                        type="button"
                        onClick={() => setVisitaTeste(opcao.valor)}
                        aria-pressed={ativo}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors ${
                          ativo ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icone size={14} /> {opcao.label}
                      </button>
                    )
                  })}
                </div>
                {visitaTeste ? (
                  <p className="-mt-3 text-sm text-slate-500">
                    Visita teste: só cadastro básico, sem plano e sem acesso ao app. Vira matrícula quando a pessoa voltar e
                    escolher um plano.
                  </p>
                ) : null}

                <Card title="Dados pessoais">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input id="fullName" label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div>
                      <Input
                        id="cpf"
                        label="CPF"
                        value={cpf}
                        onChange={(e) => {
                          const formatado = formatarCpf(e.target.value)
                          setCpf(formatado)
                          // Já mostrou erro? Revalida enquanto digita, pra sumir assim que corrigir.
                          if (erroCpf) validarCampoCpf(formatado)
                        }}
                        onBlur={() => {
                          if (cpf !== '') validarCampoCpf(cpf)
                        }}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        aria-invalid={erroCpf !== ''}
                        aria-describedby="cpf-erro"
                        className={erroCpf ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}
                        required
                      />
                      {erroCpf ? (
                        <p id="cpf-erro" className="mt-1 text-xs text-rose-600">
                          {erroCpf}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          const gerado = gerarCpfDeTeste()
                          setCpf(gerado)
                          validarCampoCpf(gerado)
                        }}
                        className="mt-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
                      >
                        Gerar CPF de teste (demonstração)
                      </button>
                    </div>
                    <Input
                      id="birthDate"
                      label="Data de nascimento"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                        Telefone
                      </label>
                      <div className="mt-1 flex gap-2">
                        <SeletorDdi value={ddi} onChange={setDdi} />
                        <input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(formatarTelefone(e.target.value))}
                          placeholder="(00) 00000-0000"
                          required
                          className="block h-10 w-full rounded-xl border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Input id="address" label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <Input
                      id="weight"
                      label="Peso (kg)"
                      type="number"
                      min={0}
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <Input
                      id="height"
                      label="Altura (cm)"
                      type="number"
                      min={0}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </Card>

                {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
                <Button type="submit" className="self-end">
                  {visitaTeste ? 'Continuar para o rosto' : 'Continuar para o plano'}
                </Button>
              </form>
            ) : null}

            {/* ---------- 2. Plano ---------- */}
            {etapa === 'plano' ? (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Qual plano {fullName.split(' ')[0]} vai fazer?</h2>
                  <p className="text-sm text-slate-500">A primeira mensalidade é cobrada agora, no balcão.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {planos.map((item) => (
                    <CartaoPlano
                      key={item.id}
                      plano={item}
                      selecionado={item.id === planoAtualId}
                      onSelecionar={() => {
                        setPlanoAtualId(item.id)
                        setErro('')
                      }}
                    />
                  ))}
                </div>
                {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
                <div className="flex items-center justify-between">
                  <BotaoVoltar onClick={() => irPara('dados')} />
                  <Button onClick={handlePlano}>Continuar para o acesso</Button>
                </div>
              </div>
            ) : null}

            {/* ---------- 3. Acesso ---------- */}
            {etapa === 'acesso' ? (
              <form onSubmit={handleAcesso} className="flex flex-col gap-5">
                <Card title="Acesso ao app">
                  <p className="text-sm text-slate-600">
                    Informe só o e-mail. A senha <strong>não</strong> é definida aqui: depois do pagamento, o sistema gera um
                    convite e o próprio aluno cria a senha pelo celular.
                  </p>
                  <div className="mt-4">
                    <Input
                      id="email"
                      label="E-mail do aluno"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailConferido(false)
                      }}
                      required
                    />
                  </div>

                  {/* RF-ATD-06: o próprio aluno confere o e-mail na tela (e-mail é falado, não digitado por ele). */}
                  {email.includes('@') ? (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                        <MailCheck size={14} /> Mostre para o aluno conferir
                      </p>
                      <p className="mt-2 break-all font-heading text-2xl font-semibold text-slate-900">{email.trim()}</p>
                      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={emailConferido}
                          onChange={(e) => setEmailConferido(e.target.checked)}
                          className="h-4 w-4 accent-emerald-700"
                        />
                        O aluno conferiu e o e-mail está correto
                      </label>
                    </div>
                  ) : null}
                </Card>
                {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
                <div className="flex items-center justify-between">
                  <BotaoVoltar onClick={() => irPara('plano')} />
                  <Button type="submit" disabled={!emailConferido}>
                    Continuar para o pagamento
                  </Button>
                </div>
              </form>
            ) : null}

            {/* ---------- 4. Pagamento ---------- */}
            {etapa === 'pagamento' && pagamentoPendente ? (
              <div className="flex flex-col gap-4">
                <PagamentoCheckout
                  pagamento={pagamentoPendente}
                  nomeAluno={fullName}
                  cpf={cpf}
                  planoNome={plano?.name ?? ''}
                  onAprovado={handlePagamentoAprovado}
                />
                <BotaoVoltar onClick={() => irPara('acesso')} />
              </div>
            ) : null}

            {/* ---------- 5. Rosto ---------- */}
            {etapa === 'rosto' ? (
              <div className="mx-auto flex max-w-xl flex-col gap-4">
                {!visitaTeste ? (
                  <Alerta tipo="sucesso">Pagamento confirmado — matrícula de {fullName} ativa.</Alerta>
                ) : null}
                <p className="text-sm text-slate-600">
                  Cadastro do rosto para o check-in. Esta etapa é opcional — pode ser feita depois pela ficha do aluno.
                </p>
                <ConsentimentoBiometria nomeAluno={fullName} consentiu={consentiuBiometria} onAlterar={setConsentiuBiometria} />
                {consentiuBiometria ? (
                  <div className="flex flex-col items-center gap-4">
                    <FaceIdPreview onCapturar={handleCapturar} rotulo="Cadastrar rosto" />
                  </div>
                ) : null}
                {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
                <Button variant="secondary" className="self-start" onClick={() => concluirRosto(null)}>
                  Pular — cadastrar rosto depois
                </Button>
              </div>
            ) : null}

            {/* ---------- 6. Concluído / Convite ---------- */}
            {etapa === 'concluido' ? (
              <div className="mx-auto flex max-w-2xl flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check size={22} />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold text-slate-900">
                      {visitaTeste ? 'Visita teste registrada' : `${fullName.split(' ')[0]} está matriculado!`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {rostoCadastrado
                        ? 'Rosto cadastrado para o check-in.'
                        : 'Rosto não cadastrado — complete depois pela ficha do aluno.'}
                    </p>
                  </div>
                </div>

                {!visitaTeste && usuarioId ? (
                  <Card title="Convite de ativação do app">
                    <ConviteAtivacaoPainel usuarioId={usuarioId} />
                  </Card>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => onVerFicha(alunoId)}>Ver ficha do aluno</Button>
                  <Button variant="secondary" onClick={onFechar}>
                    Voltar à recepção
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Resumo lateral: o que já foi decidido nesta matrícula */}
          {mostrarResumo ? (
            <aside className="h-fit rounded-2xl border border-slate-200 bg-zinc-50/60 p-5 lg:sticky lg:top-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resumo da matrícula</p>
              <div className="mt-3 divide-y divide-slate-200/70">
                <LinhaResumo label="Aluno" valor={fullName} />
                <LinhaResumo label="CPF" valor={cpf} />
                <LinhaResumo label="Plano" valor={plano?.name ?? ''} />
                <LinhaResumo label="E-mail" valor={etapa === 'plano' ? '' : email} />
              </div>
              {plano ? (
                <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">Cobrado hoje</span>
                  <span className="font-heading text-2xl font-semibold text-emerald-700">
                    {formatarMoeda(plano.price)}
                  </span>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </>
  )
}
