// Validações puras (sem acesso a dado): só dizem se um valor tem formato válido.

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

// Valida formato (11 dígitos) + os dois dígitos verificadores do CPF.
// Rejeita sequências repetidas (111.111.111-11), que passam na conta mas não existem.
export function cpfValido(cpf: string): boolean {
  const digitos = somenteDigitos(cpf)
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false

  const calcularDigito = (base: string): number => {
    const pesoInicial = base.length + 1
    const soma = base.split('').reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const primeiro = calcularDigito(digitos.slice(0, 9))
  const segundo = calcularDigito(digitos.slice(0, 10))
  return primeiro === Number(digitos[9]) && segundo === Number(digitos[10])
}

// Motivo legível pra mostrar embaixo do campo; null quando o CPF é válido.
export function motivoCpfInvalido(cpf: string): string | null {
  const digitos = somenteDigitos(cpf)
  if (digitos.length === 0) return 'Informe o CPF.'
  if (digitos.length < 11) {
    const faltam = 11 - digitos.length
    return `CPF incompleto — ${faltam === 1 ? 'falta 1 dígito' : `faltam ${faltam} dígitos`}.`
  }
  if (/^(\d)\1{10}$/.test(digitos)) return 'CPF inválido — sequência de números repetidos não existe.'
  if (!cpfValido(digitos)) return 'CPF inválido — os dois últimos dígitos não conferem. Confira com o documento.'
  return null
}

// SÓ PARA DEMONSTRAÇÃO: gera um CPF que passa na validação (dígitos verificadores
// calculados), pra apresentar o cadastro sem usar o CPF de uma pessoa real.
export function gerarCpfDeTeste(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const digito = (numeros: number[]) => {
    const soma = numeros.reduce((total, n, i) => total + n * (numeros.length + 1 - i), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  const d1 = digito(base)
  const d2 = digito([...base, d1])
  const todos = [...base, d1, d2].join('')
  // Evita a sequência repetida (inválida por regra).
  if (/^(\d)\1{10}$/.test(todos)) return gerarCpfDeTeste()
  return `${todos.slice(0, 3)}.${todos.slice(3, 6)}.${todos.slice(6, 9)}-${todos.slice(9)}`
}
