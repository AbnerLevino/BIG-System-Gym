// Cabeçalhos padrão das telas logadas. CabecalhoCentral é o da tela inicial de
// cada papel (saudação + data); CabecalhoPagina é o das demais telas.
import type { ReactNode } from 'react'
import wavingHand from '../../assets/waving-hand-3d.png'

function saudacaoDoHorario(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataPorExtenso(): string {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

interface CabecalhoCentralProps {
  nome: string
  subtitulo: string
  // Linha pequena abaixo da data (ex: "6 alunos ativos").
  contexto?: string
}

export function CabecalhoCentral({ nome, subtitulo, contexto }: CabecalhoCentralProps) {
  const primeiroNome = nome.split(' ')[0] ?? ''
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <img src={wavingHand} alt="" className="h-10 w-10 sm:h-14 sm:w-14" />
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
            {saudacaoDoHorario()}, {primeiroNome}!
          </h1>
          <p className="text-sm text-slate-500 sm:text-base">{subtitulo}</p>
        </div>
      </div>
      <div className="sm:text-right">
        <p className="text-sm font-semibold text-slate-700">{dataPorExtenso()}</p>
        {contexto ? <p className="text-xs text-slate-500">{contexto}</p> : null}
      </div>
    </header>
  )
}

interface CabecalhoPaginaProps {
  titulo: string
  descricao: string
  // Ação ou observação à direita do título.
  lateral?: ReactNode
}

export function CabecalhoPagina({ titulo, descricao, lateral }: CabecalhoPaginaProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">{titulo}</h1>
        <p className="text-sm text-slate-500">{descricao}</p>
      </div>
      {lateral}
    </div>
  )
}
