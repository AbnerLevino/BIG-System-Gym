import type { Professional } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedProfessionals } from './seed'

const KEY = 'professionals'

export function initProfessionals(): void {
  ensureSeeded<Professional>(KEY, seedProfessionals)
}

export function getProfessionals(): Professional[] {
  return readCollection<Professional>(KEY, seedProfessionals)
}

export function getProfessionalById(id: string): Professional | undefined {
  return getProfessionals().find((professional) => professional.id === id)
}