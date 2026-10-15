import type { Payment } from '../types'
import { readCollection, ensureSeeded } from './storage'
import { seedPayments } from './seed'

const KEY = 'payments'

export function initPayments(): void {
  ensureSeeded<Payment>(KEY, seedPayments)
}

export function getPayments(): Payment[] {
  return readCollection<Payment>(KEY, seedPayments)
}

export function getPaymentsBySubscriber(subscriberId: string): Payment[] {
  return getPayments().filter((payment) => payment.subscriberId === subscriberId)
}