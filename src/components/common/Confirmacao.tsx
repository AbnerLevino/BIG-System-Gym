// Pergunta de confirmação em modal (substitui o window.confirm do navegador).
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmacaoProps {
  open: boolean
  titulo: string
  children: ReactNode
  textoConfirmar: string
  textoCancelar?: string
  perigo?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function Confirmacao({
  open,
  titulo,
  children,
  textoConfirmar,
  textoCancelar = 'Voltar',
  perigo,
  onConfirmar,
  onCancelar,
}: ConfirmacaoProps) {
  return (
    <Modal open={open} title={titulo} onClose={onCancelar}>
      <div className="text-sm text-slate-600">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          {textoCancelar}
        </Button>
        <Button variant={perigo ? 'danger' : 'primary'} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
