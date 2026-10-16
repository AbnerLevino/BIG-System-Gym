import type { PhysicalAssessment } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedPhysicalAssessments } from './seed'

const KEY = 'physicalAssessments'

export function initPhysicalAssessments(): void {
  ensureSeeded<PhysicalAssessment>(KEY, seedPhysicalAssessments)
}

export function getPhysicalAssessments(): PhysicalAssessment[] {
  return readCollection<PhysicalAssessment>(KEY, seedPhysicalAssessments)
}

export function getAssessmentsBySubscriber(subscriberId: string): PhysicalAssessment[] {
  return getPhysicalAssessments()
    .filter((assessment) => assessment.subscriberId === subscriberId)
    .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))
}

export function getLatestAssessmentBySubscriber(subscriberId: string): PhysicalAssessment | undefined {
  return getAssessmentsBySubscriber(subscriberId)[0]
}

export function saveAssessment(assessment: PhysicalAssessment): void {
  const current = getPhysicalAssessments()
  const index = current.findIndex((item) => item.id === assessment.id)
  if (index === -1) {
    writeCollection(KEY, [...current, assessment])
  } else {
    const updated = [...current]
    updated[index] = assessment
    writeCollection(KEY, updated)
  }
}
