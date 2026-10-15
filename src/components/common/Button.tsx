// Componente "burro": só recebe props e desenha. Não sabe de localStorage, Zustand
// ou regra de negócio — qualquer colega usa sem precisar entender o que tem por dentro.
// Sem estilo ainda de propósito — "variant" fica como data-attribute, prontro pra
// ser estilizado (ex: via CSS "[data-variant='primary']") quando o design entrar.
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button data-variant={variant} {...props} />
}
