import type { Plan } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPlans } from './seed'

const KEY = 'plans'

export function initPlans(): void {
  ensureSeeded<Plan>(KEY, seedPlans)
}

export function getPlans(): Plan[] {
  return readCollection<Plan>(KEY, seedPlans)
}

export function getPlanById(id: string): Plan | undefined {
  return getPlans().find((plan) => plan.id === id)
}