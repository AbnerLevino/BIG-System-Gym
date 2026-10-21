// A lib "react-payment-inputs" nao publica tipos para o subpath "/images" —
// cada chave e um <g> (ReactElement) pronto pra entrar dentro de um <svg>.
declare module 'react-payment-inputs/images' {
  import type { ReactElement } from 'react'

  const images: Record<string, ReactElement>
  export default images
}
