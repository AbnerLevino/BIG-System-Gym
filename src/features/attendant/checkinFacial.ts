// Um check-in por rosto, do começo ao fim: acha o aluno pelo descritor, avalia o
// acesso (avaliarAcesso — cancelado/atraso), registra a entrada e devolve o que a
// tela precisa mostrar. Compartilhado pela tela de Check-in e pelo totem.
import { avaliarAcesso, obterAlunos, registrarCheckin, type MotivoAcesso } from '../../data'
import { encontrarPorRosto } from '../../utils/faceRecognition'
import type { Aluno } from '../../types'
import type { CapturaFacial } from './useCameraFacial'

export interface ResultadoCheckin {
  aluno: Aluno | null
  liberado: boolean
  motivo?: MotivoAcesso
  mensagem: string
  foto: string
  quando: string
}

export const MENSAGEM_POR_MOTIVO: Record<MotivoAcesso, string> = {
  granted: 'Acesso liberado.',
  cancelled: 'Matrícula cancelada.',
  latePayment: 'Acesso bloqueado: pagamento atrasado.',
}

// Só descobre quem é (sem registrar entrada) — o totem usa pra ignorar a mesma
// pessoa parada na frente da câmera antes de começar a verificação.
export function identificarPorRosto(descriptor: number[]): Aluno | null {
  return encontrarPorRosto(obterAlunos(), descriptor)
}

export function processarCheckinFacial(captura: CapturaFacial | null): ResultadoCheckin {
  const quando = new Date().toISOString()
  if (!captura) {
    return { aluno: null, liberado: false, mensagem: 'Nenhum rosto detectado. Tente novamente.', foto: '', quando }
  }

  const aluno = encontrarPorRosto(obterAlunos(), captura.descriptor)
  if (!aluno) {
    return { aluno: null, liberado: false, mensagem: 'Rosto não identificado.', foto: captura.photoUrl, quando }
  }

  const avaliacao = avaliarAcesso(aluno)
  registrarCheckin({
    id: crypto.randomUUID(),
    alunoId: aluno.id,
    timestamp: quando,
    method: 'faceId',
    accessGranted: avaliacao.liberado,
  })

  return {
    aluno,
    liberado: avaliacao.liberado,
    motivo: avaliacao.motivo,
    mensagem: MENSAGEM_POR_MOTIVO[avaliacao.motivo],
    foto: aluno.photoUrl ?? captura.photoUrl,
    quando,
  }
}

export function falar(texto: string): void {
  if (!('speechSynthesis' in window)) return
  const fala = new SpeechSynthesisUtterance(texto)
  fala.lang = 'pt-BR'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(fala)
}
