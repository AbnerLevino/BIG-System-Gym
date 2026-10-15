import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <label htmlFor={id}>
      {label}
      <input id={id} {...props} />
    </label>
  )
}
