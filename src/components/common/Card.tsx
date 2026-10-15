import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={className}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  )
}
