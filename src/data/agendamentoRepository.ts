
import type { Agendamento } from '../types/agendamento'
import {
  readCollection,
  writeCollection,
  ensureSeeded,
} from './storage'

const KEY = 'agendamentos'

const seedAgendamentos = (): Agendamento[] => []

export function inicializarAgendamentos(): void {
  ensureSeeded<Agendamento>(KEY, seedAgendamentos())
}

export function obterAgendamentos(): Agendamento[] {
  return readCollection<Agendamento>(KEY, seedAgendamentos())
}

export function obterAgendamentosPorProfissional(
  profissionalId: string,
): Agendamento[] {
  return obterAgendamentos().filter(
    (agendamento) => agendamento.profissionalId === profissionalId,
  )
}

export function obterAgendamentosPorAluno(
  alunoId: string,
): Agendamento[] {
  return obterAgendamentos().filter(
    (agendamento) => agendamento.alunoId === alunoId,
  )
}

export function salvarAgendamento(agendamento: Agendamento): void {
  const atuais = obterAgendamentos()

  const indice = atuais.findIndex(
    (item) => item.id === agendamento.id,
  )

  if (indice === -1) {
    writeCollection(KEY, [...atuais, agendamento])
    return
  }

  const atualizados = [...atuais]
  atualizados[indice] = agendamento

  writeCollection(KEY, atualizados)
}
