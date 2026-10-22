import { useState } from 'react'
import { AppLayout } from '../../components/layout'
import { Button, Card } from '../../components/common'
import { obterAlunos, avaliarAcesso, registrarCheckin, type MotivoAcesso } from '../../data'
import { encontrarPorRosto } from '../../utils/faceRecognition'
import type { Aluno } from '../../types'
import { FaceIdPreview } from './FaceIdPreview'

type Etapa = 'pronto' | 'resultado'

interface Resultado {
  aluno: Aluno | null
  liberado: boolean
  mensagem: string
  foto: string
}

const MENSAGEM_POR_MOTIVO: Record<MotivoAcesso, string> = {
  granted: 'Acesso liberado.',
  cancelled: 'Matricula cancelada.',
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

  function handleCapturar(captura: { descriptor: number[]; photoUrl: string } | null) {
    if (!captura) {
      setResultado({ aluno: null, liberado: false, mensagem: 'Nenhum rosto detectado. Tente novamente.', foto: '' })
      setEtapa('resultado')
      falar('Nenhum rosto detectado.')
      return
    }

    const alunoEncontrado = encontrarPorRosto(obterAlunos(), captura.descriptor)

    if (!alunoEncontrado) {
      setResultado({ aluno: null, liberado: false, mensagem: 'Rosto nao identificado.', foto: captura.photoUrl })
      setEtapa('resultado')
      falar('Rosto nao identificado.')
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

    setResultado({
      aluno: alunoEncontrado,
      liberado: avaliacao.liberado,
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

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="mt-1 text-sm text-slate-600">Posicione o rosto na camera e clique em verificar.</p>

      <div className="mt-6 flex flex-col items-center gap-6">
        {etapa === 'pronto' ? <FaceIdPreview onCapturar={handleCapturar} rotulo="Verificar" /> : null}

        {etapa === 'resultado' && resultado ? (
          <Card className="w-full max-w-xs">
            <div className="flex flex-col items-center gap-3 text-center">
              {resultado.foto ? (
                <img src={resultado.foto} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : null}
              {resultado.aluno ? <p className="font-semibold">{resultado.aluno.fullName}</p> : null}
              <p className={resultado.liberado ? 'text-green-700' : 'text-red-600'}>{resultado.mensagem}</p>
              <Button variant="secondary" onClick={handleNovaTentativa}>
                Nova verificacao
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  )
}
