// Check-in por reconhecimento facial (catraca simulada): à esquerda a câmera ou o
// resultado da verificação; à direita as entradas de hoje. Mesmo padrão visual da Central.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanFace } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Alerta, Button, Card } from '../../components/common'
import { AvatarAluno } from '../../components/aluno'
import { CabecalhoPagina, EstadoVazio } from '../../components/painel'
import {
  avaliarAcesso,
  dataLocalISO,
  obterAlunoPorId,
  obterAlunos,
  obterCheckins,
  registrarCheckin,
  type MotivoAcesso,
} from '../../data'
import { encontrarPorRosto } from '../../utils/faceRecognition'
import type { Aluno } from '../../types'
import { FaceIdPreview } from './FaceIdPreview'

type Etapa = 'pronto' | 'resultado'

interface Resultado {
  aluno: Aluno | null
  liberado: boolean
  motivo?: MotivoAcesso
  mensagem: string
  foto: string
}

function entradasDeHoje() {
  const hoje = dataLocalISO()
  return obterCheckins()
    .filter((checkin) => dataLocalISO(new Date(checkin.timestamp)) === hoje)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

const MENSAGEM_POR_MOTIVO: Record<MotivoAcesso, string> = {
  granted: 'Acesso liberado.',
  cancelled: 'Matrícula cancelada.',
  latePayment: 'Acesso bloqueado: pagamento atrasado.',
}

function falar(texto: string): void {
  const utterance = new SpeechSynthesisUtterance(texto)
  utterance.lang = 'pt-BR'
  window.speechSynthesis.speak(utterance)
}

export function AttendantCheckinPage() {
  const [etapa, setEtapa] = useState<Etapa>('pronto')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [entradas, setEntradas] = useState(entradasDeHoje)
  const navigate = useNavigate()

  function handleCapturar(captura: { descriptor: number[]; photoUrl: string } | null) {
    if (!captura) {
      setResultado({ aluno: null, liberado: false, mensagem: 'Nenhum rosto detectado. Tente novamente.', foto: '' })
      setEtapa('resultado')
      falar('Nenhum rosto detectado.')
      return
    }

    const alunoEncontrado = encontrarPorRosto(obterAlunos(), captura.descriptor)

    if (!alunoEncontrado) {
      setResultado({ aluno: null, liberado: false, mensagem: 'Rosto não identificado.', foto: captura.photoUrl })
      setEtapa('resultado')
      falar('Rosto não identificado.')
      return
    }

    const avaliacao = avaliarAcesso(alunoEncontrado)
    const mensagem = MENSAGEM_POR_MOTIVO[avaliacao.motivo]

    registrarCheckin({
      id: crypto.randomUUID(),
      alunoId: alunoEncontrado.id,
      timestamp: new Date().toISOString(),
      method: 'faceId',
      accessGranted: avaliacao.liberado,
    })

    setEntradas(entradasDeHoje())
    setResultado({
      aluno: alunoEncontrado,
      liberado: avaliacao.liberado,
      motivo: avaliacao.motivo,
      mensagem,
      foto: alunoEncontrado.photoUrl ?? captura.photoUrl,
    })
    setEtapa('resultado')
    falar(`${alunoEncontrado.fullName}. ${mensagem}`)
  }

  function handleNovaTentativa() {
    setResultado(null)
    setEtapa('pronto')
  }

  const liberadasHoje = entradas.filter((item) => item.accessGranted).length

  return (
    <AppLayout>
      <CabecalhoPagina
        titulo="Check-in"
        descricao="Posicione o rosto do aluno na câmera e clique em verificar."
        lateral={
          <p className="text-xs text-slate-500">
            {liberadasHoje} {liberadasHoje === 1 ? 'entrada liberada' : 'entradas liberadas'} hoje
          </p>
        }
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-5">
        <Card title={etapa === 'pronto' ? 'Câmera' : 'Resultado'} className="lg:col-span-3">
          {etapa === 'pronto' ? (
            <div className="flex justify-center">
              <FaceIdPreview onCapturar={handleCapturar} rotulo="Verificar" />
            </div>
          ) : null}

          {etapa === 'resultado' && resultado ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {resultado.foto ? (
                <img src={resultado.foto} alt="" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <ScanFace size={36} />
                </span>
              )}
              {resultado.aluno ? (
                <p className="font-heading text-xl font-semibold text-slate-900">{resultado.aluno.fullName}</p>
              ) : null}
              <Alerta tipo={resultado.liberado ? 'sucesso' : 'erro'}>{resultado.mensagem}</Alerta>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={handleNovaTentativa}>Nova verificação</Button>
                {resultado.aluno && resultado.motivo === 'latePayment' ? (
                  <Button variant="secondary" onClick={() => navigate(`/atendente?pagamento=${resultado.aluno!.id}`)}>
                    Receber pagamento
                  </Button>
                ) : null}
                {resultado.aluno ? (
                  <Button variant="secondary" onClick={() => navigate(`/atendente?aluno=${resultado.aluno!.id}`)}>
                    Abrir ficha
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </Card>

        <section aria-label="Entradas de hoje" className="lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Entradas de hoje</h2>
          {entradas.length === 0 ? (
            <EstadoVazio titulo="Nenhuma entrada ainda." descricao="Cada verificação na câmera aparece aqui." />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {entradas.map((checkin) => {
                const aluno = obterAlunoPorId(checkin.alunoId)
                if (!aluno) return null
                return (
                  <li
                    key={checkin.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <AvatarAluno aluno={aluno} tamanho="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{aluno.fullName}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        checkin.accessGranted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {checkin.accessGranted ? 'Liberado' : 'Bloqueado'}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {new Date(checkin.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
