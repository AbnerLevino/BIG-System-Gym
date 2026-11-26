// Câmera com botão de captura (cadastro de rosto e check-in pelo balcão). Liga a
// câmera quando monta (useCameraFacial) — por isso só deve ser renderizado quando a
// captura for de fato necessária.
import { useState } from 'react'
import { Alerta } from '../../components/common'
import { useCameraFacial, type CapturaFacial } from './useCameraFacial'

interface FaceIdPreviewProps {
  onCapturar: (resultado: CapturaFacial | null) => void
  rotulo?: string
}

export function FaceIdPreview({ onCapturar, rotulo }: FaceIdPreviewProps) {
  const { videoRef, carregando, erro, capturar } = useCameraFacial()
  // A análise leva alguns segundos (mais na primeira vez): o botão mostra que está trabalhando.
  const [analisando, setAnalisando] = useState(false)

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        // Espelhado como uma selfie: mexer a cabeça pra esquerda move a imagem pra esquerda,
        // o que facilita a pessoa se posicionar. É só visual (CSS), não afeta a captura.
        className="aspect-square w-full -scale-x-100 rounded-full border-4 border-emerald-700/30 object-cover"
      />
      {carregando ? <p className="text-sm text-slate-600">Carregando reconhecimento facial...</p> : null}
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      <button
        type="button"
        disabled={carregando || analisando}
        onClick={async () => {
          setAnalisando(true)
          try {
            onCapturar(await capturar())
          } finally {
            setAnalisando(false)
          }
        }}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {analisando ? 'Analisando rosto…' : (rotulo ?? 'Capturar rosto')}
      </button>
    </div>
  )
}
