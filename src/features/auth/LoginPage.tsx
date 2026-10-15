// Única tela pública. Login real (email/senha) e atalhos de demo (um clique entra
// como cada papel) convivem aqui — os dois chamam a mesma store de autenticação.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button, Card, Input } from '../../components/common'
import type { UserRole } from '../../types'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
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
    const user = useAuthStore.getState().currentUser
    if (user) navigate(ROLE_HOME[user.role])
  }

  function handleDemoLogin(role: UserRole) {
    const success = loginAsDemo(role)
    if (success) navigate(ROLE_HOME[role])
  }

  return (
    <div>
      <Card title="Entrar no BigGym">
        <form onSubmit={handleSubmit}>
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
          {error ? <p>{error}</p> : null}
          <Button type="submit">Entrar</Button>
        </form>
        <div>
          <p>Atalhos de demonstracao:</p>
          <Button variant="secondary" onClick={() => handleDemoLogin('admin')}>
            Entrar como Admin
          </Button>
          <Button variant="secondary" onClick={() => handleDemoLogin('professional')}>
            Entrar como Profissional
          </Button>
          <Button variant="secondary" onClick={() => handleDemoLogin('subscriber')}>
            Entrar como Aluno
          </Button>
        </div>
      </Card>
    </div>
  )
}
