// Menu lateral que muda de acordo com o papel logado. As URLs ficam em português
// (quem usa o sistema vê em português); só os nomes de arquivo/variável ficam em inglês.
//
// Sempre aberta (ícone + label visíveis), sem recolher/expandir. O rodapé mostra
// quem está logado (com indicador de sessão ativa) e o botão de sair.
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCog,
  Wallet,
  UserCheck,
  UserPlus,
  ScanFace,
  Dumbbell,
  TrendingUp,
  User,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import type { PapelUsuario } from '../../types'
import { useAuthStore } from '../../store/authStore'
import biggymLogoBranco from '../../assets/biggym-logo.png'
import atendenteFoto from '../../assets/atendente-demo-foto.png'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: Record<PapelUsuario, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/alunos', label: 'Alunos', icon: Users },
    { to: '/admin/planos', label: 'Planos', icon: CreditCard },
    { to: '/admin/profissionais', label: 'Profissionais', icon: UserCog },
    { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
  ],
  atendente: [
    { to: '/atendente', label: 'Atendimento', icon: UserCheck },
    { to: '/atendente/cadastro', label: 'Cadastrar aluno', icon: UserPlus },
    { to: '/atendente/checkin', label: 'Check-in', icon: ScanFace },
  ],
  professional: [{ to: '/profissional', label: 'Dashboard', icon: LayoutDashboard }],
  subscriber: [
    { to: '/aluno', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/aluno/treino', label: 'Treino', icon: Dumbbell },
    { to: '/aluno/evolucao', label: 'Evolucao', icon: TrendingUp },
    { to: '/aluno/financeiro', label: 'Financeiro', icon: Wallet },
    { to: '/aluno/perfil', label: 'Perfil', icon: User },
  ],
}

const ROLE_LABELS: Record<PapelUsuario, string> = {
  admin: 'Administrador',
  atendente: 'Atendente',
  professional: 'Profissional',
  subscriber: 'Aluno',
}

// Só temos foto fictícia pra demo do papel atendente por enquanto; os demais caem no avatar de iniciais.
const FOTOS_DEMO: Partial<Record<PapelUsuario, string>> = {
  atendente: atendenteFoto,
}

export function Sidebar() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!usuarioAtual) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex w-60 shrink-0 flex-col self-stretch overflow-hidden rounded-2xl
        bg-rose-700 shadow-lg shadow-rose-900/30"
    >
      <div className="flex h-16 shrink-0 items-center px-5 py-5">
        <img src={biggymLogoBranco} alt="BigGym" className="h-11 w-auto" />
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS[usuarioAtual.role].map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-rose-100/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 p-3">
        {/* Abrir o perfil da funcionária ainda não existe como tela — por ora é só visual. */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
        >
          <div className="relative shrink-0">
            {FOTOS_DEMO[usuarioAtual.role] ? (
              <img
                src={FOTOS_DEMO[usuarioAtual.role]}
                alt={usuarioAtual.nome}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-base font-semibold text-white">
                {usuarioAtual.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-rose-700 bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{usuarioAtual.nome}</p>
            <p className="truncate text-xs text-rose-100/50">{usuarioAtual.email}</p>
            <p className="text-[11px] uppercase tracking-wide text-rose-100/60">
              {ROLE_LABELS[usuarioAtual.role]}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-rose-100/70
            transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} className="shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
