import images from 'react-payment-inputs/images'

// Mapeia o label que `detectarBandeiraCartao` devolve (usado no texto da tela)
// para a chave do SVG real dentro de `react-payment-inputs/images`.
const CHAVE_POR_BANDEIRA: Record<string, string> = {
  Visa: 'visa',
  Mastercard: 'mastercard',
}

interface CardBrandIconProps {
  bandeira: string | null
  className?: string
}

export function CardBrandIcon({ bandeira, className }: CardBrandIconProps) {
  const chave = (bandeira && CHAVE_POR_BANDEIRA[bandeira]) || 'placeholder'

  return (
    <svg viewBox="0 0 24 16" width="1.5em" height="1em" aria-label={bandeira ?? 'Cartao'} className={className}>
      {images[chave] ?? images.placeholder}
    </svg>
  )
}
