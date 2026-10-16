import type { Goal } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedGoals } from './seed'

const KEY = 'goals'

export function initGoals(): void {
  ensureSeeded<Goal>(KEY, seedGoals)
}

export function getGoals(): Goal[] {
  return readCollection<Goal>(KEY, seedGoals)
}

export function getGoalsBySubscriber(subscriberId: string): Goal[] {
  return getGoals().filter((goal) => goal.subscriberId === subscriberId)
}

export function getActiveGoalBySubscriber(subscriberId: string): Goal | undefined {
  return getGoalsBySubscriber(subscriberId).find((goal) => goal.status === 'inProgress')
}

export function saveGoal(goal: Goal): void {
  const current = getGoals()
  const index = current.findIndex((item) => item.id === goal.id)
  if (index === -1) {
    writeCollection(KEY, [...current, goal])
  } else {
    const updated = [...current]
    updated[index] = goal
    writeCollection(KEY, updated)
  }
}
