// Pagina inicial publica (rota "/"): landing page com hero em tela cheia,
// header sobreposto (logo + navegacao) e secoes de conteudo abaixo, com scroll.
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components/common'
import homeHeroImage from '../../assets/home-hero.jpg'

const FEATURES = [
  {
    title: 'Gestao de alunos',
    description: 'Cadastro, planos, evolucao fisica e historico em um so lugar.',
  },
  {
    title: 'Treinos e metas',
    description: 'Profissionais montam treinos e acompanham metas de cada aluno.',
  },
  {
    title: 'Financeiro automatico',
    description: 'Pagamentos, recibos e inadimplencia calculados a partir dos planos.',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-white">BigGym</span>
        <nav className="flex items-center gap-6">
          <a href="#funcionalidades" className="text-white hover:text-slate-200">
            Funcionalidades
          </a>
          <Button onClick={() => navigate('/login')}>Entrar</Button>
        </nav>
      </header>

      <section
        className="relative flex h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${homeHeroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-[1] max-w-2xl px-8 text-center text-white">
          <h1 className="text-5xl font-bold">BigGym</h1>
          <p className="mt-4 text-lg text-slate-200">
            Gestao completa da sua academia: alunos, treinos, planos e financeiro em um unico
            lugar.
          </p>
          <div className="mt-8">
            <Button onClick={() => navigate('/login')}>Entrar</Button>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="px-8 py-20">
        <h2 className="text-center text-3xl font-bold">Funcionalidades</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} title={feature.title}>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
