// Estado global de sessão: guarda quem está logado agora, acessível por qualquer
// componente (sidebar, topbar, rotas) sem precisar de relação de pai/filho entre eles.

import { create } from 'zustand'
import type { Usuario, PapelUsuario } from '../types'
import { buscarUsuarioPorCredenciais, buscarUsuarioDemoPorPapel } from '../data'

const SESSION_KEY = 'biggym:session'

interface AuthState {
  usuarioAtual: Usuario | null
  login: (email: string, password: string) => boolean
  loginAsDemo: (role: PapelUsuario) => boolean
  logout: () => void
}

function loadSession(): Usuario | null {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? (JSON.parse(raw) as Usuario) : null
}

function persistSession(usuario: Usuario | null): void {
  if (usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  usuarioAtual: loadSession(),
  login: (email, password) => {
    const usuario = buscarUsuarioPorCredenciais(email, password)
    if (!usuario) return false
    persistSession(usuario)
    set({ usuarioAtual: usuario })
    return true
  },
  loginAsDemo: (role) => {
    const usuario = buscarUsuarioDemoPorPapel(role)
    if (!usuario) return false
    persistSession(usuario)
    set({ usuarioAtual: usuario })
    return true
  },
  logout: () => {
    persistSession(null)
    set({ usuarioAtual: null })
  },
}))
