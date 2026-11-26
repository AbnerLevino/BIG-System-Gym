// Contrato da agenda do profissional (RF-FUND-03). Hoje só tem seed de exemplo;
// a tela de edição do profissional (módulo Profissional/Fundação) grava aqui com
// salvarItemAgenda/removerItemAgenda, e a vitrine do aluno já passa a ler o real.
import type { AgendaProfissional } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAgendasProfissionais } from './seed'
import { DIAS_SEMANA } from './treinoRepository'

const KEY = 'professional-schedules'

export function inicializarAgendasProfissionais(): void {
  ensureSeeded<AgendaProfissional>(KEY, seedAgendasProfissionais)
}

export function obterAgendasProfissionais(): AgendaProfissional[] {
  return readCollection<AgendaProfissional>(KEY, seedAgendasProfissionais)
}

// Grade do profissional ordenada por dia da semana e horário.
export function obterAgendaPorProfissional(profissionalId: string): AgendaProfissional[] {
  return obterAgendasProfissionais()
    .filter((item) => item.profissionalId === profissionalId)
    .sort(
      (a, b) =>
        DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana) || a.horaInicio.localeCompare(b.horaInicio),
    )
}

export function salvarItemAgenda(item: AgendaProfissional): void {
  const current = obterAgendasProfissionais()
  const index = current.findIndex((atual) => atual.id === item.id)
  if (index === -1) {
    writeCollection(KEY, [...current, item])
  } else {
    const updated = [...current]
    updated[index] = item
    writeCollection(KEY, updated)
  }
}

export function removerItemAgenda(id: string): void {
  writeCollection(
    KEY,
    obterAgendasProfissionais().filter((item) => item.id !== id),
  )
}
