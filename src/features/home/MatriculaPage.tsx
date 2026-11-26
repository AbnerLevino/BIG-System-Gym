// Vitrine pública de planos (link "Planos"/"Matricule-se" da home). Não cria conta:
// a matrícula acontece na recepção, com pagamento confirmado, e o aluno recebe um
// convite pra criar a própria senha (RF-ATD-04 a 07 + RF-ALU-01).
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, KeyRound, MapPin } from 'lucide-react'
import { Button } from '../../components/common'
import { CartaoPlano } from '../../components/plano'
import { obterPlanos } from '../../data'
import biggymWordmark from '../../assets/biggym-wordmark.png'

const PASSOS = [
  {
    icon: MapPin,
    titulo: 'Venha até a recepção',
    descricao: 'Traga um documento com CPF. A recepção faz seu cadastro e o do seu rosto para a catraca.',
  },
  {
    icon: CreditCard,
    titulo: 'Pague a primeira mensalidade',
    descricao: 'Pix, cartão ou dinheiro, direto no balcão. Sua matrícula é ativada na hora.',
  },
  {
    icon: KeyRound,
    titulo: 'Crie sua senha no celular',
    descricao: 'Você recebe um link de ativação e cria sua própria senha para acessar o app.',
  },
]

export function MatriculaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planos = obterPlanos()
  const [planoEmDestaque, setPlanoEmDestaque] = useState(searchParams.get('plano') ?? '')

  return (
    <div className="min-h-screen bg-zinc-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-zinc-900/10 bg-white px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('/')} aria-label="Voltar para o início">
            <img src={biggymWordmark} alt="BigGym" className="h-8 w-auto" />
          </button>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            Já sou aluno — Entrar
          </Button>
        </header>

        <section className="mt-12 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold text-slate-900">Escolha o plano que combina com você</h1>
          <p className="mt-3 text-base text-slate-500">
            Conheça os planos da BigGym. A matrícula é feita na recepção — leva poucos minutos.
          </p>
        </section>

        {planos.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500">Nenhum plano disponível no momento.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {planos.map((plano) => (
              <CartaoPlano
                key={plano.id}
                plano={plano}
                selecionado={plano.id === planoEmDestaque}
                onSelecionar={() => setPlanoEmDestaque(plano.id)}
              />
            ))}
          </div>
        )}

        <section className="mt-14 rounded-2xl border border-slate-200 bg-zinc-50/60 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-semibold text-slate-900">Como fazer sua matrícula</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {PASSOS.map((passo, indice) => {
              const Icone = passo.icon
              return (
                <li key={passo.titulo} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icone size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Passo {indice + 1}</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{passo.titulo}</p>
                    <p className="mt-1 text-sm text-slate-500">{passo.descricao}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
