// Pagina publica de matricula: mostra o que a academia oferece, os planos, e o
// formulario de cadastro que cria um Aluno + Usuario de verdade no sistema.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../../components/common'
import { obterPlanos, salvarAluno, salvarUsuario, buscarUsuarioPorEmail } from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { Aluno, Usuario } from '../../types'

const OFERECIMENTOS = [
  { title: 'Gestao de alunos', description: 'Cadastro, planos, evolucao fisica e historico em um so lugar.' },
  { title: 'Treinos e metas', description: 'Profissionais montam treinos e acompanham metas de cada aluno.' },
  { title: 'Financeiro automatico', description: 'Pagamentos, recibos e inadimplencia calculados a partir dos planos.' },
]

export function MatriculaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const planos = obterPlanos()

  const [planoAtualId, setPlanoAtualId] = useState(searchParams.get('plano') ?? '')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!planoAtualId) {
      setError('Escolha um plano antes de se matricular.')
      return
    }
    if (buscarUsuarioPorEmail(email)) {
      setError('E-mail ja cadastrado.')
      return
    }

    const alunoId = crypto.randomUUID()
    const aluno: Aluno = {
      id: alunoId,
      fullName,
      weight: 0,
      height: 0,
      phone,
      cpf,
      address,
      birthDate,
      notes: '',
      planoAtualId,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'active',
    }
    const usuario: Usuario = {
      id: crypto.randomUUID(),
      nome: fullName,
      email,
      password,
      role: 'subscriber',
      refId: alunoId,
    }

    salvarAluno(aluno)
    salvarUsuario(usuario)
    login(email, password)
    navigate('/aluno')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Conheca a BigGym</h1>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        {OFERECIMENTOS.map((item) => (
          <Card key={item.title} title={item.title}>
            <p>{item.description}</p>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Escolha um plano</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {planos.map((plano) => (
            <button
              key={plano.id}
              type="button"
              onClick={() => setPlanoAtualId(plano.id)}
              className={`rounded-md border p-4 text-left ${
                planoAtualId === plano.id ? 'border-rose-800 ring-2 ring-rose-800/30' : 'border-slate-300'
              }`}
            >
              <p className="font-semibold">{plano.name}</p>
              <p className="text-sm text-slate-600">R$ {plano.price.toFixed(2)}</p>
              <p className="text-sm text-slate-500">{plano.modalities.join(', ')}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Matricule-se</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input id="fullName" label="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input id="phone" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input id="cpf" label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
          <Input id="address" label="Endereco" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <Input id="birthDate" label="Data de nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          <Input id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit">Matricular-se</Button>
        </form>
      </section>
    </div>
  )
}
