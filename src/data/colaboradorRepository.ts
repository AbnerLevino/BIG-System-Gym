import type {
  Colaborador,
  AlteracaoColaborador,
} from '../types/colaborador'

const CHAVE_COLABORADORES = 'biggym_colaboradores'

function gerarId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function obterColaboradores(): Colaborador[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const dados = localStorage.getItem(CHAVE_COLABORADORES)

    if (!dados) {
      return []
    }

    return JSON.parse(dados) as Colaborador[]
  } catch {
    return []
  }
}

export function obterColaboradorPorId(
  id: string,
): Colaborador | undefined {
  return obterColaboradores().find(
    (colaborador) => colaborador.id === id,
  )
}

export function salvarColaborador(
  dados: Omit<Colaborador, 'id' | 'historicoAlteracoes'> & {
    id?: string
  },
): Colaborador {
  const colaboradores = obterColaboradores()

  const existente = dados.id
    ? colaboradores.find((item) => item.id === dados.id)
    : undefined

  const historico: AlteracaoColaborador[] = existente
    ? [...existente.historicoAlteracoes]
    : []

  if (existente) {
    if (existente.cargo !== dados.cargo) {
      historico.push({
        id: gerarId(),
        data: new Date().toISOString(),
        campo: 'cargo',
        valorAnterior: existente.cargo,
        valorNovo: dados.cargo,
      })
    }

    if (existente.salario !== dados.salario) {
      historico.push({
        id: gerarId(),
        data: new Date().toISOString(),
        campo: 'salario',
        valorAnterior: String(existente.salario),
        valorNovo: String(dados.salario),
      })
    }
  }

  const colaborador: Colaborador = {
    ...dados,
    id: existente?.id ?? gerarId(),
    historicoAlteracoes: historico,
  }

  const atualizados = existente
    ? colaboradores.map((item) =>
        item.id === colaborador.id ? colaborador : item,
      )
    : [...colaboradores, colaborador]

  localStorage.setItem(
    CHAVE_COLABORADORES,
    JSON.stringify(atualizados),
  )

  return colaborador
}

export function excluirColaborador(id: string): void {
  const atualizados = obterColaboradores().filter(
    (colaborador) => colaborador.id !== id,
  )

  localStorage.setItem(
    CHAVE_COLABORADORES,
    JSON.stringify(atualizados),
  )
}