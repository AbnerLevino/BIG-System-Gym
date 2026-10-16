// Menu lateral que muda de acordo com o papel logado. As URLs ficam em português
// (quem usa o sistema vê em português); só os nomes de arquivo/variável ficam em inglês.
import { NavLink } from 'react-router-dom'
import type { PapelUsuario } from '../../types'

interface NavItem {
  to: string
  label: string
}

const NAV_ITEMS: Record<PapelUsuario, NavItem[]> = {
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
  role: PapelUsuario
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <p className="px-6 py-5 text-xl font-bold text-rose-800">BigGym</p>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-rose-50 text-rose-800' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
