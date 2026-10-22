// Reconhecimento facial de verdade, rodando só no navegador (sem backend) via
// @vladmandic/face-api — um modelo de rede neural já treinado (pesos em public/models),
// carregado em tempo de execução. Nenhuma regra de negócio do BigGym mora aqui,
// só a parte técnica de "achar rosto" e "comparar dois rostos".
import * as faceapi from '@vladmandic/face-api'

const MODELS_URL = '/models'

// Distância euclidiana entre dois descritores: abaixo disso, consideramos "mesma pessoa".
// 0.6 é o limiar recomendado pela própria biblioteca para este modelo.
export const LIMIAR_RECONHECIMENTO = 0.6

let modelosCarregados = false

export async function carregarModelos(): Promise<void> {
  if (modelosCarregados) return
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL)
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL)
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL)
  modelosCarregados = true
}

// Analisa o frame atual do vídeo e devolve o descritor do rosto encontrado
// (vetor de 128 números) — ou null se nenhum rosto foi detectado no frame.
export async function extrairDescritor(video: HTMLVideoElement): Promise<number[] | null> {
  const deteccao = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!deteccao) return null
  return Array.from(deteccao.descriptor)
}

export function compararDescritores(a: number[], b: number[]): number {
  return faceapi.euclideanDistance(a, b)
}

interface ComCandidatoFacial {
  faceDescriptor?: number[]
}

// Varre uma lista de candidatos (ex: todos os Alunos) e devolve o que tem o rosto
// mais parecido com o descritor capturado agora — ou null se ninguém bateu dentro
// do limiar. Quem só tem um rosto cadastrado (ainda não comparamos nada) não entra
// na busca.
export function encontrarPorRosto<T extends ComCandidatoFacial>(
  candidatos: T[],
  descriptor: number[],
): T | null {
  let melhor: T | null = null
  let menorDistancia = Infinity

  for (const candidato of candidatos) {
    if (!candidato.faceDescriptor) continue
    const distancia = compararDescritores(candidato.faceDescriptor, descriptor)
    if (distancia < menorDistancia) {
      menorDistancia = distancia
      melhor = candidato
    }
  }

  if (!melhor || menorDistancia > LIMIAR_RECONHECIMENTO) return null
  return melhor
}
