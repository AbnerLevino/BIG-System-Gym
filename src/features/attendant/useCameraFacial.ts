// Liga a câmera frontal e carrega o modelo de reconhecimento quando o componente
// monta; desliga ao desmontar. Usado pelo FaceIdPreview (com botão) e pelo totem
// (detecção automática contínua).
import { useCallback, useEffect, useRef, useState } from 'react'
import { carregarModelos, extrairDescritor } from '../../utils/faceRecognition'

export interface CapturaFacial {
  descriptor: number[]
  photoUrl: string
}

export function useCameraFacial() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciar() {
      try {
        await carregarModelos()
        // Pede a câmera frontal (em celular/tablet com duas câmeras); no computador é a webcam.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        if (!cancelado) setErro('Não foi possível acessar a câmera ou carregar o reconhecimento facial.')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    iniciar()
    return () => {
      cancelado = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // Analisa o quadro atual: devolve o descritor do rosto + uma foto, ou null se não há rosto.
  const capturar = useCallback(async (): Promise<CapturaFacial | null> => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return null
    const descriptor = await extrairDescritor(video)
    if (!descriptor) return null

    // A foto sai espelhada, igual ao que a pessoa viu na tela. O descritor acima é
    // extraído do vídeo original (sem espelhar), então o reconhecimento não muda.
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const contexto = canvas.getContext('2d')
    contexto?.translate(canvas.width, 0)
    contexto?.scale(-1, 1)
    contexto?.drawImage(video, 0, 0)
    return { descriptor, photoUrl: canvas.toDataURL('image/jpeg', 0.7) }
  }, [])

  return { videoRef, carregando, erro, capturar }
}
