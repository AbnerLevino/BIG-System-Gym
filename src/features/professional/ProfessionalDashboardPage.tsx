import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function ProfessionalDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Profissional</h1>
      <Card>
        <p className="text-slate-300">Placeholder — lista de alunos vinculados, filtrada por tipo de atendimento, entra aqui.</p>
      </Card>
    </AppLayout>
  )
}
