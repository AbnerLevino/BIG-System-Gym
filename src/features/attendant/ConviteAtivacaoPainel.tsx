// Convite de ativação do lado do atendente (RF-ATD-05/06/07). Mostra o link e o QR
// code que o aluno usa pra criar a própria senha — o atendente nunca vê nem define
// a senha. SIMULADO: sem serviço de e-mail, o link aparece aqui na tela.
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { CheckCircle2, Copy, Mail, RefreshCw } from 'lucide-react'
import { Alerta, Button, Input } from '../../components/common'
import {
  corrigirEmailEReenviarConvite,
  gerarConviteAtivacao,
  montarLinkAtivacao,
  obterConviteVigente,
  obterUsuarioPorId,
  usuarioPendenteDeSenha,
} from '../../data'

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

interface ConviteAtivacaoPainelProps {
  usuarioId: string
  onAlterado?: () => void
}

export function ConviteAtivacaoPainel({ usuarioId, onAlterado }: ConviteAtivacaoPainelProps) {
  const [versao, setVersao] = useState(0)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [corrigindo, setCorrigindo] = useState(false)
  const [novoEmail, setNovoEmail] = useState('')
  const [erro, setErro] = useState('')

  const usuario = obterUsuarioPorId(usuarioId)
  const pendente = usuario ? usuarioPendenteDeSenha(usuario) : false
  const convite = pendente ? obterConviteVigente(usuarioId) : undefined
  const link = convite ? montarLinkAtivacao(convite.token) : ''

  useEffect(() => {
    if (!link) {
      setQrCodeUrl('')
      return
    }
    QRCode.toDataURL(link, { margin: 1, width: 220 }).then(setQrCodeUrl)
  }, [link])

  if (!usuario) return null

  function atualizar() {
    setVersao(versao + 1)
    onAlterado?.()
  }

  if (!pendente) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-700">
        <CheckCircle2 size={16} /> Conta ativada — {usuario.email} já entra no app com a própria senha.
      </p>
    )
  }

  function handleCopiar() {
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleGerarNovo() {
    gerarConviteAtivacao(usuarioId)
    atualizar()
  }

  function handleCorrigir(event: React.FormEvent) {
    event.preventDefault()
    const resultado = corrigirEmailEReenviarConvite(usuarioId, novoEmail)
    if (!resultado.ok) {
      setErro(resultado.erro)
      return
    }
    setErro('')
    setCorrigindo(false)
    atualizar()
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
        Envio simulado
      </span>

      {convite ? (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR code do link de ativação" className="h-40 w-40 shrink-0 rounded-xl border border-slate-200" />
          ) : (
            <div className="h-40 w-40 shrink-0 rounded-xl border border-slate-200 bg-slate-50" />
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm text-slate-700">
              <Mail size={14} className="shrink-0 text-slate-400" />
              Convite para <strong className="truncate">{usuario.email}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              O aluno aponta a câmera do celular para o QR code (ou abre o link) e cria a própria senha. Em produção, este
              link chegaria por e-mail.
            </p>
            <p className="mt-2 text-xs text-slate-500">Uso único · válido até {formatarDataHora(convite.expiraEm)}</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-xs text-slate-600">{link}</code>
              <button
                type="button"
                onClick={handleCopiar}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <Copy size={12} /> {copiado ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          O convite de <strong>{usuario.email}</strong> expirou sem ser usado. Gere um novo link para o aluno ativar a conta.
        </p>
      )}

      {corrigindo ? (
        <form onSubmit={handleCorrigir} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4">
          <Input
            id="novoEmail"
            label="E-mail correto do aluno"
            type="email"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            required
            autoFocus
          />
          <p className="text-xs text-slate-500">O link anterior deixa de funcionar e um novo é gerado — o cadastro não é duplicado.</p>
          {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
          <div className="flex gap-2">
            <Button type="submit">Corrigir e gerar novo link</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCorrigindo(false)
                setErro('')
              }}
            >
              Voltar
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleGerarNovo}>
            <RefreshCw size={14} /> Gerar novo link
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setNovoEmail(usuario.email)
              setCorrigindo(true)
            }}
          >
            <Mail size={14} /> E-mail errado? Corrigir
          </Button>
        </div>
      )}
    </div>
  )
}
