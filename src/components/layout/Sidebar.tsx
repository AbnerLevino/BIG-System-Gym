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
    <aside>
      <p>BigGym</p>
      {NAV_ITEMS[role].map((item) => (
        <NavLink key={item.to} to={item.to} end>
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
