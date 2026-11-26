// RF-ALU-01: o aluno abre o link do convite (no celular) e cria a própria senha.
// Token válido → define a senha, o token é queimado (uso único) e já entra no app.
// Token expirado/usado/inválido → explica e orienta a pedir novo convite na recepção.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { KeyRound, ShieldAlert } from 'lucide-react'
import { Button, Input } from '../../components/common'
import { TAMANHO_MINIMO_SENHA, ativarConta, validarConvite, type SituacaoConvite } from '../../data'
import { useAuthStore } from '../../store/authStore'
import biggymWordmark from '../../assets/biggym-wordmark.png'

const MENSAGEM_ERRO: Record<Exclude<SituacaoConvite, 'valido'>, { titulo: string; texto: string }> = {
  expirado: {
    titulo: 'Este convite expirou',
    texto: 'Links de ativação valem por 48 horas. Peça um novo convite na recepção da academia.',
  },
  usado: {
    titulo: 'Esta conta já foi ativada',
    texto: 'O link de ativação só pode ser usado uma vez. Entre com seu e-mail e a senha que você criou.',
  },
  invalido: {
    titulo: 'Link de ativação inválido',
    texto: 'Este link não existe ou foi substituído por um convite mais novo. Peça um novo convite na recepção.',
  },
}

export function AtivarContaPage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const entrarComo = useAuthStore((state) => state.entrarComo)
  const [validacao] = useState(() => validarConvite(token))

  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (senha !== confirmacao) {
      setErro('As senhas não conferem.')
      return
    }
    const resultado = ativarConta(token, senha)
    if (!resultado.ok) {
      setErro(resultado.erro)
      return
    }
    entrarComo(resultado.usuario)
    navigate('/aluno')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-900/10 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <img src={biggymWordmark} alt="BigGym" className="h-8 w-auto" />

        {validacao.situacao === 'valido' && validacao.usuario ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <KeyRound size={20} />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-slate-900">
                Olá, {validacao.usuario.nome.split(' ')[0]}!
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Crie sua senha para acessar o app da BigGym com <strong>{validacao.usuario.email}</strong>.
              </p>
            </div>
            <Input
              id="senha"
              label="Nova senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={TAMANHO_MINIMO_SENHA}
              autoComplete="new-password"
              required
            />
            <Input
              id="confirmacao"
              label="Confirme a senha"
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              autoComplete="new-password"
              required
            />
            <p className="-mt-2 text-xs text-slate-500">Mínimo de {TAMANHO_MINIMO_SENHA} caracteres.</p>
            {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
            <Button type="submit">Criar senha e entrar</Button>
          </form>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert size={20} />
            </span>
            <h1 className="font-heading text-2xl font-semibold text-slate-900">
              {MENSAGEM_ERRO[validacao.situacao as Exclude<SituacaoConvite, 'valido'>].titulo}
            </h1>
            <p className="text-sm text-slate-600">
              {MENSAGEM_ERRO[validacao.situacao as Exclude<SituacaoConvite, 'valido'>].texto}
            </p>
            <Link to="/login" className="mt-2 text-sm font-semibold text-emerald-700 hover:underline">
              Ir para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
