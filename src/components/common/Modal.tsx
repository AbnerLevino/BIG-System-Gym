import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalSize = 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: ModalSize
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
}

// Pilha dos modais abertos: com modal dentro de modal (ex: confirmação dentro da
// ficha), o Esc fecha só o de cima.
const pilhaDeModais: string[] = []

export function Modal({ open, title, onClose, children, size = 'md' }: ModalProps) {
  const id = useId()
  // Ref: o onClose costuma ser uma função nova a cada render; sem isso o efeito
  // reempilharia o modal de fora por cima do de dentro.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    pilhaDeModais.push(id)
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && pilhaDeModais[pilhaDeModais.length - 1] === id) onCloseRef.current()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      const indice = pilhaDeModais.indexOf(id)
      if (indice !== -1) pilhaDeModais.splice(indice, 1)
    }
  }, [open, id])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      // Clique no fundo escuro fecha; clique dentro da caixa não.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full ${SIZE_CLASSES[size]} flex-col rounded-2xl bg-white p-6 shadow-lg`}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
