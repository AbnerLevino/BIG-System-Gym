// Estado global de sessão: guarda quem está logado agora, acessível por qualquer
// componente (sidebar, topbar, rotas) sem precisar de relação de pai/filho entre eles.

import { create } from 'zustand'
import type { User, UserRole } from '../types'
import { findUserByCredentials, findDemoUserByRole } from '../data'

const SESSION_KEY = 'biggym:session'

interface AuthState {
  currentUser: User | null
  login: (email: string, password: string) => boolean
  loginAsDemo: (role: UserRole) => boolean
  logout: () => void
}

function loadSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

function persistSession(user: User | null): void {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: loadSession(),
  login: (email, password) => {
    const user = findUserByCredentials(email, password)
    if (!user) return false
    persistSession(user)
    set({ currentUser: user })
    return true
  },
  loginAsDemo: (role) => {
    const user = findDemoUserByRole(role)
    if (!user) return false
    persistSession(user)
    set({ currentUser: user })
    return true
  },
  logout: () => {
    persistSession(null)
    set({ currentUser: null })
  },
}))
