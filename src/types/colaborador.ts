export interface AlteracaoColaborador {
  id: string
  data: string
  campo: 'cargo' | 'salario'
  valorAnterior: string
  valorNovo: string
}

export interface Colaborador {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  tipoContrato: string
  dataAdmissao: string
  salario: number
  cref: string
  validadeCref: string
  historicoAlteracoes: AlteracaoColaborador[]
}