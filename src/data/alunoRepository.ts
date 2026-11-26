import type { Aluno } from '../types'
import { somenteDigitos } from '../utils/validacoes'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAlunos } from './seed'

const KEY = 'subscribers'

export function inicializarAlunos(): void {
  ensureSeeded<Aluno>(KEY, seedAlunos)
}

export function obterAlunos(): Aluno[] {
  return readCollection<Aluno>(KEY, seedAlunos)
}

export function obterAlunoPorId(id: string): Aluno | undefined {
  return obterAlunos().find((aluno) => aluno.id === id)
}

export function salvarAluno(aluno: Aluno): void {
  const current = obterAlunos()
  const index = current.findIndex((item) => item.id === aluno.id)
  if (index === -1) {
    writeCollection(KEY, [...current, aluno])
  } else {
    const updated = [...current]
    updated[index] = aluno
    writeCollection(KEY, updated)
  }
}

// Compara só os dígitos, pra "123.456.789-09" e "12345678909" serem o mesmo CPF.
export function buscarAlunoPorCpf(cpf: string): Aluno | undefined {
  const digitos = somenteDigitos(cpf)
  return obterAlunos().find((aluno) => somenteDigitos(aluno.cpf) === digitos)
}

export function obterAlunosAtivosPorPlano(planoId: string): Aluno[] {
  return obterAlunos().filter((aluno) => aluno.planoAtualId === planoId && aluno.status === 'active')
}
