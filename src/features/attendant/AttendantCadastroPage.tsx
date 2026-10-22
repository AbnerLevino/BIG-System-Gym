import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input, SeletorDdi } from '../../components/common'
import { obterPlanos, salvarAluno, salvarUsuario, buscarUsuarioPorEmail } from '../../data'
import type { Aluno, Pagamento, Usuario } from '../../types'
import { FaceIdPreview } from './FaceIdPreview'
import { PagamentoCheckout } from '../../components/payment'
import { PAISES_DDI, formatarCpf, formatarTelefone } from '../../utils/mascaras'

type Etapa = 'formulario' | 'pagamento' | 'captura' | 'sucesso'

const PASSOS: { etapa: Etapa; label: string }[] = [
  { etapa: 'formulario', label: 'Dados' },
  { etapa: 'pagamento', label: 'Pagamento' },
  { etapa: 'captura', label: 'Rosto' },
  { etapa: 'sucesso', label: 'Confirmacao' },
]

function IndicadorDePassos({ atual }: { atual: Etapa }) {
  const indiceAtual = PASSOS.findIndex((passo) => passo.etapa === atual)

  return (
    <ol className="flex items-center gap-2">
      {PASSOS.map((passo, index) => {
        const concluido = index < indiceAtual
        const ativo = index === indiceAtual
        return (
          <li key={passo.etapa} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                  concluido
                    ? 'bg-rose-800 text-white'
                    : ativo
                      ? 'border-2 border-rose-800 text-rose-800'
                      : 'border border-slate-300 text-slate-400'
                }`}
              >
                {concluido ? <Check size={12} /> : index + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  ativo ? 'text-rose-800' : concluido ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {passo.label}
              </span>
            </div>
            {index < PASSOS.length - 1 ? <span className="h-px w-6 bg-slate-200" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

export function AttendantCadastroPage() {
  const navigate = useNavigate()
  const planos = obterPlanos()

  const [etapa, setEtapa] = useState<Etapa>('formulario')
  const [visitaTeste, setVisitaTeste] = useState(false)
  const [planoAtualId, setPlanoAtualId] = useState('')
  const planoSelecionadoNome = planos.find((plano) => plano.id === planoAtualId)?.name ?? ''
  const [fullName, setFullName] = useState('')
  const [ddi, setDdi] = useState(PAISES_DDI[0].ddi)
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [alunoId] = useState(() => crypto.randomUUID())
  const [pagamentoPendente, setPagamentoPendente] = useState<Pagamento | null>(null)

  function handleSubmitFormulario(event: React.FormEvent) {
    event.preventDefault()

    if (!visitaTeste) {
      if (!planoAtualId) {
        setErro('Escolha um plano antes de matricular, ou marque "Visita teste".')
        return
      }
      if (buscarUsuarioPorEmail(email)) {
        setErro('E-mail ja cadastrado.')
        return
      }

      const planoSelecionado = planos.find((plano) => plano.id === planoAtualId)
      if (!planoSelecionado) return

      setPagamentoPendente({
        id: crypto.randomUUID(),
        academiaId: 'gym-1',
        alunoId,
        planoId: planoSelecionado.id,
        originalValue: planoSelecionado.price,
        paidValue: null,
        lateFee: 0,
        paymentMethod: null,
        dueDate: new Date().toISOString().slice(0, 10),
        paymentDate: null,
        status: 'pending',
        receiptNumber: null,
      })

      setErro('')
      setEtapa('pagamento')
      return
    }

    setErro('')
    setEtapa('captura')
  }

  function handleCapturar(captura: { descriptor: number[]; photoUrl: string } | null) {
    if (!captura) {
      setErro('Nenhum rosto detectado. Tente novamente com boa iluminacao.')
      return
    }

    const aluno: Aluno = {
      id: alunoId,
      fullName,
      weight: 0,
      height: 0,
      phone: `${ddi} ${phone}`,
      cpf,
      address,
      birthDate,
      notes: '',
      planoAtualId: visitaTeste ? null : planoAtualId,
      startDate: new Date().toISOString().slice(0, 10),
      status: visitaTeste ? 'trial' : 'active',
      faceDescriptor: captura.descriptor,
      photoUrl: captura.photoUrl,
    }
    salvarAluno(aluno)

    if (!visitaTeste) {
      const usuario: Usuario = {
        id: crypto.randomUUID(),
        nome: fullName,
        email,
        password,
        role: 'subscriber',
        refId: alunoId,
      }
      salvarUsuario(usuario)
    }

    setErro('')
    setEtapa('sucesso')
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cadastro presencial</h1>
        <IndicadorDePassos atual={etapa} />
      </div>

      {etapa === 'formulario' ? (
        <form
          onSubmit={handleSubmitFormulario}
          className={`mx-auto mt-6 flex flex-col gap-6 transition-all duration-300 ease-out ${
            visitaTeste ? 'max-w-xl' : 'max-w-5xl'
          }`}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={visitaTeste}
              onChange={(e) => setVisitaTeste(e.target.checked)}
              className="h-4 w-4 accent-rose-800"
            />
            Visita teste (sem plano, sem login — so cadastro basico)
          </label>

          <div className={`grid gap-6 ${visitaTeste ? '' : 'lg:grid-cols-2'}`}>
          <Card title="Dados pessoais">
            <div className="flex flex-col gap-4">
              <Input id="fullName" label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

              <div>
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
                    className="block h-10 w-full rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
                  />
                </div>
              </div>

              <Input
                id="cpf"
                label="CPF"
                value={cpf}
                onChange={(e) => setCpf(formatarCpf(e.target.value))}
                placeholder="000.000.000-00"
                required
              />
              <Input id="address" label="Endereco" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <Input
                id="birthDate"
                label="Data de nascimento"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          </Card>

          {!visitaTeste ? (
            <Card title="Acesso e plano">
              <div className="flex flex-col gap-4">
                <Input id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input
                  id="password"
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div>
                  <p className="text-sm font-medium text-slate-700">Plano</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {planos.map((plano) => {
                      const selecionado = planoAtualId === plano.id
                      return (
                        <button
                          key={plano.id}
                          type="button"
                          onClick={() => setPlanoAtualId(plano.id)}
                          className={`relative flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors ${
                            selecionado ? 'border-rose-800 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {selecionado ? (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-800 text-white">
                              <Check size={12} />
                            </span>
                          ) : null}
                          <p className="font-semibold text-slate-900">{plano.name}</p>
                          <p className="mt-1 text-2xl font-bold text-rose-800">R$ {plano.price.toFixed(2)}</p>
                          <p className="mt-2 text-xs text-slate-500">{plano.modalities.join(' · ')}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
          </div>

          {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
          <Button type="submit" className="self-start">
            Continuar para cadastro do rosto
          </Button>
        </form>
      ) : null}

      {etapa === 'pagamento' && pagamentoPendente ? (
        <div className="mx-auto mt-6 max-w-xl">
          <PagamentoCheckout
            pagamento={pagamentoPendente}
            nomeAluno={fullName}
            cpf={cpf}
            planoNome={planoSelecionadoNome}
            onAprovado={() => setEtapa('captura')}
          />
        </div>
      ) : null}

      {etapa === 'captura' ? (
        <div className="mx-auto mt-6 max-w-xl">
          <p className="text-sm text-slate-600">
            Ultima etapa: posicione o rosto de {fullName} na camera. Isso e obrigatorio para o check-in funcionar.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <FaceIdPreview onCapturar={handleCapturar} rotulo="Cadastrar rosto" />
            {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
          </div>
        </div>
      ) : null}

      {etapa === 'sucesso' ? (
        <Card className="mx-auto mt-6 max-w-xl">
          <p>{visitaTeste ? 'Visita teste registrada.' : 'Aluno cadastrado com sucesso.'} Rosto cadastrado para o check-in.</p>
          <Button className="mt-4" onClick={() => navigate('/atendente')}>
            Voltar ao atendimento
          </Button>
        </Card>
      ) : null}
      </div>
    </AppLayout>
  )
}
