import type { ConviteAtivacao } from '../types'
import { readCollection, writeCollection, ensureSeeded } from './storage'
import { seedConvitesAtivacao } from './seed'

const KEY = 'activation-invites'

export function inicializarConvitesAtivacao(): void {
  ensureSeeded<ConviteAtivacao>(KEY, seedConvitesAtivacao)
}

export function obterConvitesAtivacao(): ConviteAtivacao[] {
  return readCollection<ConviteAtivacao>(KEY, seedConvitesAtivacao)
}

export function obterConvitePorToken(token: string): ConviteAtivacao | undefined {
  return obterConvitesAtivacao().find((convite) => convite.token === token)
}

export function obterConvitesPorUsuario(usuarioId: string): ConviteAtivacao[] {
  return obterConvitesAtivacao().filter((convite) => convite.usuarioId === usuarioId)
}

export function salvarConviteAtivacao(convite: ConviteAtivacao): void {
  const current = obterConvitesAtivacao()
  const index = current.findIndex((item) => item.id === convite.id)
  if (index === -1) {
    writeCollection(KEY, [...current, convite])
  } else {
    const updated = [...current]
    updated[index] = convite
    writeCollection(KEY, updated)
  }
}
