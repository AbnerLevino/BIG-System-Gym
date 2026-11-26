// Modo totem do check-in: tela cheia, sem menu, pensada para ficar numa TV/tablet na
// entrada da academia. A câmera procura rosto o tempo todo (sem botão); ao reconhecer,
// mostra foto, nome, RA e LIBERADO/BLOQUEADO por alguns segundos e volta a esperar.
// A regra é a mesma da tela de Check-in (processarCheckinFacial).
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Maximize, ScanFace, UserX, X, XCircle } from 'lucide-react'
import { dataLocalISO, obterCheckins, obterPlanoPorId, obterRaDoAluno } from '../../data'
import logoBranco from '../../assets/biggym-logo.png'
import { falar, processarCheckinFacial, type ResultadoCheckin } from './checkinFacial'
import { useCameraFacial } from './useCameraFacial'

// Intervalo entre tentativas de detecção enquanto ninguém foi reconhecido.
const INTERVALO_DETECCAO_MS = 700
// Quanto tempo o resultado fica na tela antes de voltar a esperar.
const TEMPO_RESULTADO_MS = { liberado: 5000, bloqueado: 6500, naoIdentificado: 3500 }
// A mesma pessoa parada na frente da câmera não gera uma segunda entrada logo em seguida.
const IGNORAR_MESMO_ALUNO_MS = 15000

function contarEntradasHoje(): number {
  const hoje = dataLocalISO()
  return obterCheckins().filter((item) => item.accessGranted && dataLocalISO(new Date(item.timestamp)) === hoje).length
}

function useRelogio(): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return agora
}

// Barra que esvazia durante o tempo em que o resultado fica na tela.
function BarraDeTempo({ duracaoMs, cor }: { duracaoMs: number; cor: string }) {
  const [cheia, setCheia] = useState(true)
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setCheia(false))
    return () => cancelAnimationFrame(quadro)
  }, [])
  return (
    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
      <div
        className={`h-full ${cor} transition-[width] ease-linear`}
        style={{ width: cheia ? '100%' : '0%', transitionDuration: `${duracaoMs}ms` }}
      />
    </div>
  )
}

export function AttendantTotemPage() {
  const navigate = useNavigate()
  const agora = useRelogio()
  const { videoRef, carregando, erro, capturar } = useCameraFacial()
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null)
  const [entradasHoje, setEntradasHoje] = useState(contarEntradasHoje)
  const ocupado = useRef(false)
  const ultimo = useRef<{ alunoId: string; em: number } | null>(null)

  // Laço de detecção: só roda enquanto não há resultado na tela.
  useEffect(() => {
    if (carregando || erro || resultado) return
    const timer = setInterval(async () => {
      if (ocupado.current) return
      ocupado.current = true
      try {
        const captura = await capturar()
        if (!captura) return // ninguém na frente da câmera: continua esperando
        const novo = processarCheckinFacial(captura)
        if (novo.aluno) {
          const repetido =
            ultimo.current?.alunoId === novo.aluno.id && Date.now() - ultimo.current.em < IGNORAR_MESMO_ALUNO_MS
          if (repetido) return
          ultimo.current = { alunoId: novo.aluno.id, em: Date.now() }
          const primeiroNome = novo.aluno.fullName.split(' ')[0]
          falar(novo.liberado ? `Bem-vindo, ${primeiroNome}. Acesso liberado.` : `${primeiroNome}, acesso bloqueado. Procure a recepção.`)
        } else {
          falar('Rosto não identificado. Procure a recepção.')
        }
        setEntradasHoje(contarEntradasHoje())
        setResultado(novo)
      } finally {
        ocupado.current = false
      }
    }, INTERVALO_DETECCAO_MS)
    return () => clearInterval(timer)
  }, [carregando, erro, resultado, capturar])

  const duracao = !resultado
    ? 0
    : !resultado.aluno
      ? TEMPO_RESULTADO_MS.naoIdentificado
      : resultado.liberado
        ? TEMPO_RESULTADO_MS.liberado
        : TEMPO_RESULTADO_MS.bloqueado

  // Depois do tempo do resultado, volta a esperar o próximo.
  useEffect(() => {
    if (!resultado) return
    const timer = setTimeout(() => setResultado(null), duracao)
    return () => clearTimeout(timer)
  }, [resultado, duracao])

  function telaCheia() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(() => {})
  }

  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Topo: marca, relógio e controles discretos */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-4">
          <img src={logoBranco} alt="BigGym" className="h-9 w-auto" />
          <span className="hidden h-6 w-px bg-white/15 sm:block" />
          <span className="hidden text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 sm:block">Check-in</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-heading text-3xl font-semibold leading-none tabular-nums">{hora}</p>
            <p className="mt-1 text-xs capitalize text-zinc-400">{data}</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={telaCheia}
              aria-label="Tela cheia"
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Maximize size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/atendente/checkin')}
              aria-label="Sair do modo totem"
              className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Esperando: câmera sempre visível (o vídeo nunca desmonta, pra não religar a câmera) */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10 [animation-duration:2.5s]" aria-hidden />
          <div className="relative h-[min(58vh,30rem)] w-[min(58vh,30rem)] overflow-hidden rounded-full ring-4 ring-emerald-500/60 ring-offset-8 ring-offset-zinc-950">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
            {carregando ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <ScanFace size={64} className="animate-pulse text-zinc-600" />
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-center">
          {erro ? (
            <>
              <p className="font-heading text-3xl font-semibold text-rose-400">Câmera indisponível</p>
              <p className="mt-2 text-zinc-400">{erro}</p>
            </>
          ) : carregando ? (
            <p className="font-heading text-3xl font-semibold text-zinc-400">Preparando o reconhecimento facial…</p>
          ) : (
            <>
              <p className="font-heading text-4xl font-semibold sm:text-5xl">Olhe para a câmera</p>
              <p className="mt-3 flex items-center justify-center gap-2 text-zinc-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Reconhecimento automático — não precisa tocar em nada
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-6 text-center text-sm text-zinc-500 sm:px-10">
        {entradasHoje} {entradasHoje === 1 ? 'entrada liberada' : 'entradas liberadas'} hoje
      </footer>

      {/* Resultado: cobre a tela inteira por alguns segundos */}
      {resultado ? <PainelResultado key={resultado.quando} resultado={resultado} duracaoMs={duracao} /> : null}
    </div>
  )
}

function PainelResultado({ resultado, duracaoMs }: { resultado: ResultadoCheckin; duracaoMs: number }) {
  const { aluno } = resultado

  if (!aluno) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-950 to-zinc-950 px-6 text-center">
        {resultado.foto ? (
          <img src={resultado.foto} alt="" className="h-56 w-56 rounded-full object-cover opacity-80 ring-8 ring-amber-500/70" />
        ) : (
          <span className="flex h-56 w-56 items-center justify-center rounded-full bg-zinc-900 ring-8 ring-amber-500/70">
            <UserX size={80} className="text-amber-400" />
          </span>
        )}
        <div>
          <p className="font-heading text-5xl font-semibold">Rosto não identificado</p>
          <p className="mt-3 text-xl text-amber-200/80">Procure a recepção para cadastrar seu rosto.</p>
        </div>
        <BarraDeTempo duracaoMs={duracaoMs} cor="bg-amber-400" />
      </div>
    )
  }

  const liberado = resultado.liberado
  const primeiroNome = aluno.fullName.split(' ')[0]
  const plano = aluno.planoAtualId ? obterPlanoPorId(aluno.planoAtualId) : undefined
  const hora = new Date(resultado.quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const motivo =
    resultado.motivo === 'latePayment'
      ? 'Mensalidade em atraso — procure a recepção.'
      : resultado.motivo === 'cancelled'
        ? 'Matrícula cancelada — procure a recepção.'
        : `Bom treino, ${primeiroNome}!`

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br px-6 ${
        liberado ? 'from-emerald-950 via-zinc-950 to-zinc-950' : 'from-rose-950 via-zinc-950 to-zinc-950'
      }`}
    >
      <div className="flex w-full max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-16">
        <img
          src={resultado.foto}
          alt=""
          className={`h-64 w-64 shrink-0 rounded-full object-cover ring-8 ring-offset-8 ring-offset-zinc-950 md:h-80 md:w-80 ${
            liberado ? 'ring-emerald-500' : 'ring-rose-500'
          }`}
        />
        <div className="min-w-0 text-center md:text-left">
          <p className="text-lg uppercase tracking-[0.25em] text-zinc-400">
            {liberado ? 'Bem-vindo de volta' : 'Acesso não permitido'}
          </p>
          <p className="mt-3 font-heading text-5xl font-semibold leading-tight sm:text-6xl">{aluno.fullName}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="rounded-xl border border-white/15 bg-white/5 px-4 py-2">
              <span className="mr-2 text-xs uppercase tracking-widest text-zinc-400">RA</span>
              <span className="font-mono text-2xl font-semibold tracking-wider">{obterRaDoAluno(aluno.id)}</span>
            </span>
            {plano ? (
              <span className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-lg text-zinc-300">{plano.name}</span>
            ) : null}
          </div>
          <div
            className={`mt-8 inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-heading text-3xl font-bold uppercase tracking-wide sm:text-4xl ${
              liberado ? 'bg-emerald-500 text-emerald-950' : 'bg-rose-600 text-white'
            }`}
          >
            {liberado ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
            {liberado ? 'Acesso liberado' : 'Acesso bloqueado'}
          </div>
          <p className={`mt-5 text-xl ${liberado ? 'text-emerald-200/90' : 'text-rose-200/90'}`}>
            {motivo} <span className="text-zinc-500">· {hora}</span>
          </p>
        </div>
      </div>
      <BarraDeTempo duracaoMs={duracaoMs} cor={liberado ? 'bg-emerald-400' : 'bg-rose-500'} />
    </div>
  )
}
