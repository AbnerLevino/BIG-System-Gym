import type { Atendente } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAtendentes } from './seed'

const KEY = 'attendants'

export function inicializarAtendentes(): void {
  ensureSeeded<Atendente>(KEY, seedAtendentes)
}

export function obterAtendentes(): Atendente[] {
  return readCollection<Atendente>(KEY, seedAtendentes)
}

export function obterAtendentePorId(id: string): Atendente | undefined {
  return obterAtendentes().find((atendente) => atendente.id === id)
}

export function salvarAtendente(atendente: Atendente): void {
  const current = obterAtendentes()
  const index = current.findIndex((item) => item.id === atendente.id)
  if (index === -1) {
    writeCollection(KEY, [...current, atendente])
  } else {
    const updated = [...current]
    updated[index] = atendente
    writeCollection(KEY, updated)
  }
}
