import type { Workout } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedWorkouts } from './seed'

const KEY = 'workouts'

export function initWorkouts(): void {
  ensureSeeded<Workout>(KEY, seedWorkouts)
}

export function getWorkouts(): Workout[] {
  return readCollection<Workout>(KEY, seedWorkouts)
}

export function getWorkoutsBySubscriber(subscriberId: string): Workout[] {
  return getWorkouts().filter((workout) => workout.subscriberId === subscriberId)
}

export function getActiveWorkoutBySubscriber(subscriberId: string): Workout | undefined {
  return getWorkoutsBySubscriber(subscriberId).find((workout) => workout.active)
}

// Salvar um treino ativo desativa os demais do mesmo aluno (só um ativo por vez, preserva historico).
export function saveWorkout(workout: Workout): void {
  const current = getWorkouts()
  const withDeactivated = workout.active
    ? current.map((item) =>
        item.subscriberId === workout.subscriberId && item.id !== workout.id
          ? { ...item, active: false }
          : item,
      )
    : current

  const index = withDeactivated.findIndex((item) => item.id === workout.id)
  if (index === -1) {
    writeCollection(KEY, [...withDeactivated, workout])
  } else {
    const updated = [...withDeactivated]
    updated[index] = workout
    writeCollection(KEY, updated)
  }
}
