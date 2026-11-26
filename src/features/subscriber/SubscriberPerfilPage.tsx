// Perfil do aluno: dados da matrícula (só leitura — alteração é na recepção,
// RF-ATD-10) e troca da própria senha.
import { useState } from 'react'
import { Check, KeyRound, Lock } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import { TAMANHO_MINIMO_SENHA, alterarSenha, obterAlunoPorId, obterPlanoPorId } from '../../data'
import { useAuthStore } from '../../store/authStore'

function formatarDataBr(data: string): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{valor || '—'}</span>
    </div>
  )
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

export function SubscriberPerfilPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)!
  const entrarComo = useAuthStore((state) => state.entrarComo)
  const aluno = obterAlunoPorId(usuarioAtual.refId)
  const plano = aluno?.planoAtualId ? obterPlanoPorId(aluno.planoAtualId) : undefined

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  function handleTrocarSenha(event: React.FormEvent) {
    event.preventDefault()
    setSucesso(false)
    if (novaSenha !== confirmacao) {
      setErro('A confirmação não confere com a nova senha.')
      return
    }
    const resultado = alterarSenha(usuarioAtual.id, senhaAtual, novaSenha)
    if (!resultado.ok) {
      setErro(resultado.erro)
      return
    }
    // A sessão guarda o Usuario — atualiza pra refletir a senha nova.
    entrarComo(resultado.usuario)
    setErro('')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmacao('')
    setSucesso(true)
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          {aluno?.photoUrl ? (
            <img src={aluno.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-700">
              {iniciais(aluno?.fullName ?? usuarioAtual.nome)}
            </span>
          )}
          <div>
            <h1 className="font-heading text-2xl font-semibold text-slate-900">{aluno?.fullName ?? usuarioAtual.nome}</h1>
            <p className="text-sm text-slate-500">{usuarioAtual.email}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card title="Meus dados">
            {aluno ? (
              <>
                <Linha label="CPF" valor={aluno.cpf} />
                <Linha label="Telefone" valor={aluno.phone} />
                <Linha label="Endereço" valor={aluno.address} />
                <Linha label="Nascimento" valor={formatarDataBr(aluno.birthDate)} />
                <Linha
                  label="Peso / altura"
                  valor={`${aluno.weight ? `${aluno.weight} kg` : '—'} / ${aluno.height ? `${aluno.height} cm` : '—'}`}
                />
                <Linha label="Plano" valor={plano?.name ?? 'Sem plano'} />
                <Linha label="Aluno desde" valor={formatarDataBr(aluno.startDate)} />
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock size={12} /> Para alterar seus dados, fale com a recepção.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Dados da matrícula não encontrados.</p>
            )}
          </Card>

          <Card title="Trocar senha">
            <form onSubmit={handleTrocarSenha} className="flex flex-col gap-4">
              <Input
                id="senhaAtual"
                label="Senha atual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Input
                id="novaSenha"
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={TAMANHO_MINIMO_SENHA}
                autoComplete="new-password"
                required
              />
              <Input
                id="confirmacao"
                label="Confirme a nova senha"
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
                required
              />
              <p className="-mt-2 text-xs text-slate-500">Mínimo de {TAMANHO_MINIMO_SENHA} caracteres.</p>
              {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
              {sucesso ? (
                <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                  <Check size={14} /> Senha alterada com sucesso.
                </p>
              ) : null}
              <Button type="submit" className="self-start">
                <KeyRound size={14} /> Salvar nova senha
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
