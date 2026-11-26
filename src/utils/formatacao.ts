// Formatação de exibição usada em todas as telas (padrão brasileiro).

// 99.9 -> "R$ 99,90"
export function formatarMoeda(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 71.5 -> "71,5" (até uma casa decimal)
export function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

// "2026-11-26" -> "26/11/2026"; vazio -> "—"
export function formatarDataBr(data: string | null | undefined): string {
  if (!data) return '—'
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}
