import { initUsers } from './userRepository'
import { initSubscribers } from './subscriberRepository'
import { initProfessionals } from './professionalRepository'
import { initPlans } from './planRepository'
import { initPayments } from './paymentRepository'

export * from './userRepository'
export * from './subscriberRepository'
export * from './professionalRepository'
export * from './planRepository'
export * from './paymentRepository'

export function initAllData(): void {
  initUsers()
  initSubscribers()
  initProfessionals()
  initPlans()
  initPayments()
}