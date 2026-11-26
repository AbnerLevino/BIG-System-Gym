// Catálogo de planos pra recepção: o que mostrar pro cliente no balcão, com quantos
// alunos ativos cada plano tem e o atalho pra matricular já no plano escolhido.
// Só consulta — criar/editar plano é do Admin (RF-ADM-01), não do atendente.
import { useNavigate } from 'react-router-dom'
import { UserPlus, Users } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button } from '../../components/common'
import { CartaoPlano } from '../../components/plano'
import { CabecalhoPagina } from '../../components/painel'
import { obterAlunosAtivosPorPlano, obterPlanos } from '../../data'

export function AttendantPlanosPage() {
  const navigate = useNavigate()
  const planos = obterPlanos()

  return (
    <AppLayout>
      <CabecalhoPagina
        titulo="Planos"
        descricao="O que a BigGym oferece hoje — use para apresentar os planos no balcão."
        lateral={<p className="text-xs text-slate-500">Preços e condições são definidos pela administração.</p>}
      />

      {planos.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">Nenhum plano cadastrado.</p>
          <p className="mt-1 text-xs text-slate-500">Os planos são cadastrados pela administração.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {planos.map((plano) => {
            const ativos = obterAlunosAtivosPorPlano(plano.id).length
            return (
              <CartaoPlano
                key={plano.id}
                plano={plano}
                rodape={
                  <div className="flex flex-col gap-3">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={14} /> {ativos} {ativos === 1 ? 'aluno ativo' : 'alunos ativos'} neste plano
                    </p>
                    <Button onClick={() => navigate(`/atendente?cadastro=novo&plano=${plano.id}`)}>
                      <UserPlus size={14} /> Matricular neste plano
                    </Button>
                  </div>
                }
              />
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
