import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className ?? ''}`}>
      {title ? <h3 className="mb-3 font-heading text-lg font-semibold text-slate-900">{title}</h3> : null}
      {children}
    </div>
  )
}
