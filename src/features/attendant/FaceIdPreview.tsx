// Componente autossuficiente: liga a câmera e carrega o modelo no momento em que é
// montado na tela (por isso só deve ser renderizado quando a captura for de fato
// necessária) — evita o bug de tentar plugar o video num elemento que ainda não existe.
import { useEffect, useRef, useState } from 'react'
import { carregarModelos, extrairDescritor } from '../../utils/faceRecognition'

interface CapturaResultado {
  descriptor: number[]
  photoUrl: string
}

interface FaceIdPreviewProps {
  onCapturar: (resultado: CapturaResultado | null) => void
  rotulo?: string
}

export function FaceIdPreview({ onCapturar, rotulo }: FaceIdPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciar() {
      try {
        await carregarModelos()
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        if (!cancelado) setErro('Nao foi possivel acessar a camera ou carregar o reconhecimento facial.')
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

  async function handleCapturar() {
    const video = videoRef.current
    if (!video) {
      onCapturar(null)
      return
    }

    const descriptor = await extrairDescritor(video)
    if (!descriptor) {
      onCapturar(null)
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const photoUrl = canvas.toDataURL('image/jpeg', 0.7)

    onCapturar({ descriptor, photoUrl })
  }

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="aspect-square w-full rounded-full border-4 border-emerald-700/30 object-cover"
      />
      {carregando ? <p className="text-sm text-slate-600">Carregando reconhecimento facial...</p> : null}
      {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
      <button
        type="button"
        disabled={carregando}
        onClick={handleCapturar}
        className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {rotulo ?? 'Capturar rosto'}
      </button>
    </div>
  )
}
