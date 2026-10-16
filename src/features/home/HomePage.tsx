// Pagina inicial publica (rota "/"): landing page com hero em tela cheia,
// header sobreposto (logo + navegacao) e secoes de conteudo abaixo, com scroll.
import { useState } from 'react'
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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const isSearchOpen = isSearchFocused || searchValue.length > 0

  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-6">
          <span className="text-3xl font-bold text-white">BigGym</span>
          <div className="flex items-center gap-6 pl-6">
            <button type="button" className="group relative overflow-hidden rounded-md px-3 py-1 text-base text-white">
              <span className="pointer-events-none absolute left-0 top-0 h-[0.2rem] w-full origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute right-0 top-0 h-full w-[0.2rem] origin-top scale-y-0 bg-white transition-transform duration-200 delay-150 group-hover:scale-y-100" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-[0.2rem] w-full origin-right scale-x-0 bg-white transition-transform duration-200 delay-300 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-full w-[0.2rem] origin-bottom scale-y-0 bg-white transition-transform duration-200 delay-500 group-hover:scale-y-100" />
              Quem Somos
            </button>
            <button type="button" className="group relative overflow-hidden rounded-md px-3 py-1 text-base text-white">
              <span className="pointer-events-none absolute left-0 top-0 h-[0.2rem] w-full origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute right-0 top-0 h-full w-[0.2rem] origin-top scale-y-0 bg-white transition-transform duration-200 delay-150 group-hover:scale-y-100" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-[0.2rem] w-full origin-right scale-x-0 bg-white transition-transform duration-200 delay-300 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-full w-[0.2rem] origin-bottom scale-y-0 bg-white transition-transform duration-200 delay-500 group-hover:scale-y-100" />
              Academias
            </button>
            <button type="button" className="group relative overflow-hidden rounded-full px-3 py-1 text-base text-white">
              <span className="pointer-events-none absolute left-0 top-0 h-[0.2rem] w-full origin-left scale-x-0 bg-white transition-transform duration-200 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute right-0 top-0 h-full w-[0.2rem] origin-top scale-y-0 bg-white transition-transform duration-200 delay-150 group-hover:scale-y-100" />
              <span className="pointer-events-none absolute bottom-0 right-0 h-[0.2rem] w-full origin-right scale-x-0 bg-white transition-transform duration-200 delay-300 group-hover:scale-x-100" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-full w-[0.2rem] origin-bottom scale-y-0 bg-white transition-transform duration-200 delay-500 group-hover:scale-y-100" />
              Planos
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <Button onClick={() => navigate('/login')}>Entrar</Button>
        </nav>
      </header>

      <section className="relative h-[95vh]">
        <div
          className="absolute inset-y-0 left-[calc(50%-4rem)] right-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homeHeroImage})` }}
        />
        <div className="absolute inset-y-0 left-0 z-[1] flex w-1/2 items-center overflow-hidden rounded-r-[4rem] bg-rose-950">
          <div className="relative z-[1] -top-12 w-full pl-20 pr-8 text-white">
          <p className="font-heading text-[2.9rem] font-normal leading-none">TODA ACADEMIA</p>
          <p className="font-heading text-5xl font-normal leading-none">
            MERECE SER <span className="font-bold">BIG.</span>
          </p>
          <div className="mt-8 flex w-full items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group relative inline-flex h-12 w-52 flex-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-rose-600 font-sans text-sm font-semibold text-white transition-colors hover:bg-rose-500"
            >
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 208 48" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="206"
                  height="46"
                  rx="23"
                  ry="23"
                  stroke="white"
                  strokeWidth="2"
                  pathLength={100}
                  strokeDasharray={100}
                  className="[stroke-dashoffset:100] transition-[stroke-dashoffset] duration-500 ease-in-out group-hover:[stroke-dashoffset:0]"
                />
              </svg>
              <span className="relative z-[1]">Escolha o Melhor Plano</span>
            </button>
            <div className={`relative flex-none transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-80' : 'w-40'}`}>
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6-10.6 7.5 7.5 0 0010.6 10.6z"
                />
              </svg>
              <input
                type="text"
                placeholder={isSearchOpen ? 'Busque pela sua cidade' : 'Busque pela..'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-12 w-full rounded-full border-2 border-white bg-slate-800/90 py-0 pl-10 pr-4 font-sans text-sm font-normal text-white placeholder-slate-400 placeholder:text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>
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
