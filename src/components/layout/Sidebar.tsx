// Menu lateral que muda de acordo com o papel logado. As URLs ficam em português
// (quem usa o sistema vê em português); só os nomes de arquivo/variável ficam em inglês.
import { NavLink } from 'react-router-dom'
import type { UserRole } from '../../types'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/alunos', label: 'Alunos' },
    { to: '/admin/planos', label: 'Planos' },
    { to: '/admin/profissionais', label: 'Profissionais' },
    { to: '/admin/financeiro', label: 'Financeiro' },
  ],
  professional: [{ to: '/profissional', label: 'Dashboard' }],
  subscriber: [
    { to: '/aluno', label: 'Dashboard' },
    { to: '/aluno/treino', label: 'Treino' },
    { to: '/aluno/evolucao', label: 'Evolucao' },
    { to: '/aluno/financeiro', label: 'Financeiro' },
    { to: '/aluno/perfil', label: 'Perfil' },
  ],
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 flex-col gap-1 border-r border-slate-800 bg-slate-950 p-4">
      <p className="mb-4 text-xl font-bold text-gold">BigGym</p>
      {NAV_ITEMS[role].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-gold text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
