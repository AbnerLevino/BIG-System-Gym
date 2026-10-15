import type { Subscriber } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedSubscribers } from './seed'

const KEY = 'subscribers'

export function initSubscribers(): void {
  ensureSeeded<Subscriber>(KEY, seedSubscribers)
}

export function getSubscribers(): Subscriber[] {
  return readCollection<Subscriber>(KEY, seedSubscribers)
}

export function getSubscriberById(id: string): Subscriber | undefined {
  return getSubscribers().find((subscriber) => subscriber.id === id)
}

export function saveSubscriber(subscriber: Subscriber): void {
  const current = getSubscribers()
  const index = current.findIndex((item) => item.id === subscriber.id)
  if (index === -1) {
    writeCollection(KEY, [...current, subscriber])
  } else {
    const updated = [...current]
    updated[index] = subscriber
    writeCollection(KEY, updated)
  }
}