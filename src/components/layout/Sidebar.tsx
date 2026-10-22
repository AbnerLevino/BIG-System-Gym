// Menu lateral que muda de acordo com o papel logado. As URLs ficam em português
// (quem usa o sistema vê em português); só os nomes de arquivo/variável ficam em inglês.
//
// Sempre comeca recolhida (só ícones, faixa estreita). O único gatilho pra abrir é
// o mouse: entrar na área expande por cima do conteúdo (sem empurrar o layout),
// sair recolhe de volta — nenhum botão, nenhum estado salvo.
import { NavLink } from 'react-router-dom'
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
  type LucideIcon,
} from 'lucide-react'
import type { PapelUsuario } from '../../types'
import biggymIcon from '../../assets/biggym-icon-black.png'
import biggymWordmark from '../../assets/biggym-wordmark.png'

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

interface SidebarProps {
  role: PapelUsuario
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <div className="group relative h-screen w-16 shrink-0">
      <aside
        className="absolute left-0 top-0 flex h-screen w-16 flex-col overflow-hidden border-r
          border-slate-200 bg-white transition-all duration-200 group-hover:w-60 group-hover:shadow-lg"
      >
        <div className="relative flex h-16 items-center px-3 py-5">
          {/* Fechada: só o braço (arquivo recortado). Aberta (hover): logo completa (BIG + braço). */}
          <img
            src={biggymIcon}
            alt="BigGym"
            className="ml-1 h-8 w-8 object-contain transition-all duration-200 group-hover:scale-0 group-hover:opacity-0"
          />
          <img
            src={biggymWordmark}
            alt="BigGym"
            className="absolute left-3 h-11 w-auto scale-75 opacity-0 transition-all duration-200 group-hover:translate-x-2 group-hover:scale-100 group-hover:opacity-100"
          />
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS[role].map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-rose-50 text-rose-800' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
