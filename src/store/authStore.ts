// Estado global de sessão: guarda quem está logado agora, acessível por qualquer
// componente (sidebar, topbar, rotas) sem precisar de relação de pai/filho entre eles.

import { create } from 'zustand'
import type { Usuario, PapelUsuario } from '../types'
import {
  buscarUsuarioPorCredenciais,
  buscarUsuarioDemoPorPapel,
  buscarUsuarioPorEmail,
  alunoPodeAcessarSistema,
  usuarioPendenteDeSenha,
} from '../data'

const SESSION_KEY = 'biggym:session'

// 'bloqueado' = credencial certa, mas aluno com matrícula cancelada (RF-ATD-11).
// 'pendente' = conta criada na recepção, mas o aluno ainda não criou a senha pelo convite.
export type ResultadoLogin = 'ok' | 'invalido' | 'bloqueado' | 'pendente'

// Só aluno tem bloqueio de acesso; os outros papéis sempre entram.
export function usuarioTemAcessoLiberado(usuario: Usuario): boolean {
  return usuario.role !== 'subscriber' || alunoPodeAcessarSistema(usuario.refId)
}

interface AuthState {
  usuarioAtual: Usuario | null
  login: (email: string, password: string) => ResultadoLogin
  loginAsDemo: (role: PapelUsuario) => boolean
  // Entra direto com um Usuario já validado (ex: logo após ativar a conta).
  entrarComo: (usuario: Usuario) => void
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
    if (!usuario) {
      const porEmail = buscarUsuarioPorEmail(email)
      return porEmail && usuarioPendenteDeSenha(porEmail) ? 'pendente' : 'invalido'
    }
    if (!usuarioTemAcessoLiberado(usuario)) return 'bloqueado'
    persistSession(usuario)
    set({ usuarioAtual: usuario })
    return 'ok'
  },
  loginAsDemo: (role) => {
    const usuario = buscarUsuarioDemoPorPapel(role)
    if (!usuario || !usuarioTemAcessoLiberado(usuario)) return false
    persistSession(usuario)
    set({ usuarioAtual: usuario })
    return true
  },
  entrarComo: (usuario) => {
    persistSession(usuario)
    set({ usuarioAtual: usuario })
  },
  logout: () => {
    persistSession(null)
    set({ usuarioAtual: null })
  },
}))
