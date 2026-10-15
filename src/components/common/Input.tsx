import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-300" htmlFor={id}>
      {label}
      <input
        id={id}
        className={`rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-gold ${className}`}
        {...props}
      />
    </label>
  )
}
