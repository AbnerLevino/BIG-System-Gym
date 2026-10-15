import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function AdminDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Admin</h1>
      <Card>
        <p className="text-slate-300">Placeholder — receita do mes, inadimplencia, alunos ativos e aniversariantes entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
