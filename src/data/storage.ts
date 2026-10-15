// Camada genérica que esconde o localStorage (ele só guarda texto, por isso o
// JSON.stringify/parse). Os *Repository.ts chamam essas 3 funções em vez de tocar
// no localStorage direto — se um dia trocar pra um banco real, só este arquivo muda.
const PREFIX = 'biggym:'

export function readCollection<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return fallback
  return JSON.parse(raw) as T[]
}

export function writeCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items))
}

export function ensureSeeded<T>(key: string, seedData: T[]): void {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) {
    writeCollection(key, seedData)
  }
}