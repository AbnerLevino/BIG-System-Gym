import type { Assignment } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedAssignments } from './seed'

const KEY = 'assignments'

export function initAssignments(): void {
  ensureSeeded<Assignment>(KEY, seedAssignments)
}

export function getAssignments(): Assignment[] {
  return readCollection<Assignment>(KEY, seedAssignments)
}

export function getAssignmentsBySubscriber(subscriberId: string): Assignment[] {
  return getAssignments().filter((assignment) => assignment.subscriberId === subscriberId)
}

export function getAssignmentsByProfessional(professionalId: string): Assignment[] {
  return getAssignments().filter((assignment) => assignment.professionalId === professionalId)
}

export function getPersonalAssignmentBySubscriber(subscriberId: string): Assignment | undefined {
  return getAssignmentsBySubscriber(subscriberId).find((assignment) => assignment.type === 'personal')
}

export function saveAssignment(assignment: Assignment): void {
  const current = getAssignments()
  const index = current.findIndex((item) => item.id === assignment.id)
  if (index === -1) {
    writeCollection(KEY, [...current, assignment])
  } else {
    const updated = [...current]
    updated[index] = assignment
    writeCollection(KEY, updated)
  }
}
