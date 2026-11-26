// Cartão de um Plano, igual em todo lugar que mostra plano: catálogo do atendente,
// etapa de plano do cadastro, "Meu plano" do aluno e vitrine pública (/matricula).
// Só exibe o que existe em Plano (nome, preço, modalidades, condições, origem).
import type { ReactNode } from 'react'
import { Check, Handshake } from 'lucide-react'
import type { NomeParceiro, Plano } from '../../types'
import { formatarMoeda } from '../../utils/formatacao'

const LABEL_PARCEIRO: Record<NomeParceiro, string> = {
  totalpass: 'TotalPass',
  wellhub: 'Wellhub',
}

interface CartaoPlanoProps {
  plano: Plano
  // Modo seleção (cadastro): o cartão vira um botão com estado marcado.
  selecionado?: boolean
  onSelecionar?: () => void
  // Faixa de destaque no topo (ex: "Seu plano").
  destaque?: string
  // Rodapé livre (ex: botão "Matricular neste plano", contagem de alunos).
  rodape?: ReactNode
}

export function CartaoPlano({ plano, selecionado = false, onSelecionar, destaque, rodape }: CartaoPlanoProps) {
  const selecionavel = onSelecionar !== undefined
  const realcado = selecionado || destaque !== undefined

  const conteudo = (
    <>
      {destaque ? (
        <span className="absolute -top-3 left-5 rounded-full bg-emerald-700 px-3 py-0.5 text-xs font-semibold text-white">
          {destaque}
        </span>
      ) : null}
      {selecionavel ? (
        <span
          className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
            selecionado ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white'
          }`}
        >
          {selecionado ? <Check size={14} /> : null}
        </span>
      ) : null}

      <p className="pr-8 font-heading text-lg font-semibold text-slate-900">{plano.name}</p>
      {plano.origin === 'partner' && plano.partnerName ? (
        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          <Handshake size={12} /> Via {LABEL_PARCEIRO[plano.partnerName]}
        </span>
      ) : null}

      <p className="mt-3 font-heading text-3xl font-semibold text-emerald-700">
        {formatarMoeda(plano.price)}
      </p>
      {plano.conditions ? <p className="mt-1 text-sm text-slate-500">{plano.conditions}</p> : null}

      <ul className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-4">
        {plano.modalities.map((modalidade) => (
          <li key={modalidade} className="flex items-center gap-2 text-sm text-slate-700">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check size={10} />
            </span>
            {modalidade}
          </li>
        ))}
      </ul>

      {rodape ? <div className="mt-auto pt-5">{rodape}</div> : null}
    </>
  )

  const classes = `relative flex h-full flex-col rounded-2xl border-2 bg-white p-5 text-left transition-all duration-200 ${
    realcado ? 'border-emerald-700 shadow-md' : 'border-slate-200'
  } ${selecionavel ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''} ${
    selecionavel && !selecionado ? 'hover:border-emerald-600/40' : ''
  }`

  if (selecionavel) {
    return (
      <button type="button" onClick={onSelecionar} aria-pressed={selecionado} className={classes}>
        {conteudo}
      </button>
    )
  }
  return <div className={classes}>{conteudo}</div>
}
