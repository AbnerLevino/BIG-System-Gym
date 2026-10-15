import { AppLayout } from '../../components/layout'
import { Card } from '../../components/common'

export function SubscriberDashboardPage() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard do Aluno</h1>
      <Card>
        <p className="text-slate-300">Placeholder — proximo pagamento, treino do dia e meta ativa entram aqui.</p>
      </Card>
    </AppLayout>
  )
}
