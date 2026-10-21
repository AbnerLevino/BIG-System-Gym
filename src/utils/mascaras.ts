// Mascaras de formatacao para campos de formulario (telefone com DDI e CPF).

export interface PaisDdi {
  ddi: string
  // Codigo ISO 3166-1 alpha-2 em minusculo, usado como classe `fi-xx` da lib flag-icons.
  iso: string
  nome: string
}

export const PAISES_DDI: PaisDdi[] = [
  { ddi: '+55', iso: 'br', nome: 'Brasil' },
  { ddi: '+1', iso: 'us', nome: 'Estados Unidos' },
  { ddi: '+351', iso: 'pt', nome: 'Portugal' },
  { ddi: '+54', iso: 'ar', nome: 'Argentina' },
  { ddi: '+595', iso: 'py', nome: 'Paraguai' },
  { ddi: '+598', iso: 'uy', nome: 'Uruguai' },
]

export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)

  if (digitos.length <= 2) return digitos
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

export function formatarCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)

  if (digitos.length <= 3) return digitos
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

export function formatarNumeroCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 16)
  return digitos.replace(/(.{4})/g, '$1 ').trim()
}

export function formatarValidadeCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4)
  if (digitos.length <= 2) return digitos
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
}
