// Única tela pública. Login real (email/senha) e atalhos de demo (um clique entra
// como cada papel) convivem aqui — os dois chamam a mesma store de autenticação.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button, Card, Input } from '../../components/common'
import type { PapelUsuario } from '../../types'

const ROLE_HOME: Record<PapelUsuario, string> = {
  admin: '/admin',
  atendente: '/atendente',
  professional: '/profissional',
  subscriber: '/aluno',
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const loginAsDemo = useAuthStore((state) => state.loginAsDemo)
  const navigate = useNavigate()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const success = login(email, password)
    if (!success) {
      setError('E-mail ou senha invalidos.')
      return
    }
    setError('')
    const usuario = useAuthStore.getState().usuarioAtual
    if (usuario) navigate(ROLE_HOME[usuario.role])
  }

  function handleDemoLogin(role: PapelUsuario) {
    const success = loginAsDemo(role)
    if (success) navigate(ROLE_HOME[role])
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card title="Entrar no BigGym" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit">Entrar</Button>
        </form>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="mb-2 text-sm text-slate-600">Atalhos de demonstracao:</p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => handleDemoLogin('admin')}>
              Entrar como Admin
            </Button>
            <Button variant="secondary" onClick={() => handleDemoLogin('atendente')}>
              Entrar como Atendente
            </Button>
            <Button variant="secondary" onClick={() => handleDemoLogin('professional')}>
              Entrar como Profissional
            </Button>
            <Button variant="secondary" onClick={() => handleDemoLogin('subscriber')}>
              Entrar como Aluno
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
