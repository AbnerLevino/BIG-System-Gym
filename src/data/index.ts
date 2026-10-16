import { initUsers } from './userRepository'
import { initSubscribers } from './subscriberRepository'
import { initProfessionals } from './professionalRepository'
import { initPlans } from './planRepository'
import { initPayments } from './paymentRepository'
import { initAssignments } from './assignmentRepository'
import { initWorkouts } from './workoutRepository'
import { initGoals } from './goalRepository'
import { initPhysicalAssessments } from './physicalAssessmentRepository'

export * from './userRepository'
export * from './subscriberRepository'
export * from './professionalRepository'
export * from './planRepository'
export * from './paymentRepository'
export * from './assignmentRepository'
export * from './workoutRepository'
export * from './goalRepository'
export * from './physicalAssessmentRepository'

export function initAllData(): void {
  initUsers()
  initSubscribers()
  initProfessionals()
  initPlans()
  initPayments()
  initAssignments()
  initWorkouts()
  initGoals()
  initPhysicalAssessments()
}