import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-rose-800 text-white hover:bg-rose-900',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
      {...props}
    >
      <span className="pointer-events-none absolute left-0 top-0 h-[0.2rem] w-full origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute right-0 top-0 h-full w-[0.2rem] origin-top scale-y-0 bg-white transition-transform duration-200 delay-150 group-hover:scale-y-100" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-[0.2rem] w-full origin-right scale-x-0 bg-white transition-transform duration-200 delay-300 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-full w-[0.2rem] origin-bottom scale-y-0 bg-white transition-transform duration-200 delay-500 group-hover:scale-y-100" />
      {children}
    </button>
  )
}
