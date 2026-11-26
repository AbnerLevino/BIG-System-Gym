// Ficha do aluno vista pelo profissional (abre em modal, como a do atendente).
// Só leitura: cadastro é responsabilidade do atendente. Aqui o profissional
// acompanha meta, treino e o histórico de avaliações físicas (principal + mensais).
import { useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Button, Card } from '../../components/common'
import { CabecalhoFicha } from '../../components/aluno'
import { Linha, formatarDataBr } from '../../components/painel'
import {
  DIAS_SEMANA,
  agruparExerciciosPorDia,
  obterAlunoPorId,
  obterAvaliacoesPorAluno,
  obterMetaAtivaDoAluno,
  obterTreinoAtivoPorAluno,
  profissionalAtendeAluno,
} from '../../data'
import type { AvaliacaoFisica } from '../../types'
import { LABEL_STATUS_META, NOME_DIA, formatarNumero, rotuloMedida } from './rotulos'

interface FichaAlunoProfissionalProps {
  alunoId: string
  profissionalId: string
  onNovaAvaliacao: () => void
}

// Diferença em relação à avaliação anterior, ex: "−2 kg" / "+1,5 cm".
function Variacao({ atual, anterior, unidade }: { atual: number; anterior?: number; unidade: string }) {
  if (anterior === undefined || anterior === atual) return null
  const diferenca = atual - anterior
  const texto = `${diferenca > 0 ? '+' : '−'}${formatarNumero(Math.abs(diferenca))} ${unidade}`
  return <span className="ml-1.5 text-xs font-semibold text-slate-500">{texto}</span>
}

function SeloTipo({ tipo }: { tipo: AvaliacaoFisica['tipo'] }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        tipo === 'principal' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {tipo === 'principal' ? 'Principal' : 'Mensal'}
    </span>
  )
}

export function FichaAlunoProfissional({ alunoId, profissionalId, onNovaAvaliacao }: FichaAlunoProfissionalProps) {
  const aluno = obterAlunoPorId(alunoId)
  const avaliacoes = obterAvaliacoesPorAluno(alunoId)
  const [selecionadaId, setSelecionadaId] = useState(avaliacoes[0]?.id)

  if (!aluno || !profissionalAtendeAluno(profissionalId, alunoId)) {
    return (
      <p className="text-sm text-slate-600">Este aluno não tem vínculo personal com você, então a ficha não pode ser aberta.</p>
    )
  }

  const meta = obterMetaAtivaDoAluno(alunoId)
  const treino = obterTreinoAtivoPorAluno(alunoId)
  const diasDeTreino = treino
    ? DIAS_SEMANA.filter((dia) => agruparExerciciosPorDia(treino)[dia].length > 0)
    : []

  const indice = Math.max(0, avaliacoes.findIndex((item) => item.id === selecionadaId))
  const selecionada = avaliacoes[indice]
  // A lista vem da mais recente para a mais antiga: a anterior é a próxima posição.
  const anterior = avaliacoes[indice + 1]

  return (
    <div>
      <CabecalhoFicha
        aluno={aluno}
        acoes={
          <Button onClick={onNovaAvaliacao}>
            <Plus size={14} /> Nova avaliação
          </Button>
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card title="Dados pessoais">
          <Linha label="CPF" valor={aluno.cpf} />
          <Linha label="Telefone" valor={aluno.phone} />
          <Linha label="Nascimento" valor={formatarDataBr(aluno.birthDate)} />
          <Linha
            label="Peso / altura no cadastro"
            valor={`${aluno.weight ? `${aluno.weight} kg` : '—'} / ${aluno.height ? `${aluno.height} cm` : '—'}`}
          />
          <Linha label="Início na academia" valor={formatarDataBr(aluno.startDate)} />
          {aluno.notes ? <Linha label="Observações" valor={aluno.notes} /> : null}
          <p className="mt-3 text-xs text-slate-500">Para corrigir algum dado, o aluno procura a recepção.</p>
        </Card>

        <Card title="Meta e treino">
          <Linha
            label="Meta ativa"
            valor={meta ? meta.meta.description : 'Nenhuma meta em andamento'}
          />
          {meta ? (
            <>
              <Linha label="Prazo" valor={formatarDataBr(meta.meta.deadline)} />
              <Linha label="Situação" valor={LABEL_STATUS_META[meta.progresso.status]} />
            </>
          ) : null}
          <Linha
            label="Treino da semana"
            valor={
              diasDeTreino.length > 0
                ? diasDeTreino.map((dia) => NOME_DIA[dia].slice(0, 3)).join(', ')
                : 'Sem exercícios montados'
            }
          />
          {treino ? <Linha label="Exercícios no treino" valor={treino.exercises.length} /> : null}
        </Card>

        <Card title="Avaliações físicas" className="lg:col-span-2">
          {!selecionada ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
              <ClipboardList className="mx-auto mb-2 text-slate-300" size={28} />
              <p className="text-sm font-medium text-slate-700">Nenhuma avaliação ainda.</p>
              <p className="mt-1 text-xs text-slate-500">A primeira avaliação lançada será a principal (referência).</p>
              <Button className="mt-4" onClick={onNovaAvaliacao}>
                <Plus size={14} /> Lançar avaliação principal
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SeloTipo tipo={selecionada.tipo} />
                  <span className="text-sm font-semibold text-slate-800">{formatarDataBr(selecionada.assessmentDate)}</span>
                  {anterior ? (
                    <span className="text-xs text-slate-500">
                      · comparando com {formatarDataBr(anterior.assessmentDate)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  <Linha label="Objetivo" valor={selecionada.objective || '—'} />
                  <Linha
                    label="Peso"
                    valor={
                      <>
                        {formatarNumero(selecionada.weight)} kg
                        <Variacao atual={selecionada.weight} anterior={anterior?.weight} unidade="kg" />
                      </>
                    }
                  />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Medidas corporais</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {Object.entries(selecionada.measurements).map(([nome, valor]) => (
                    <div key={nome} className="rounded-xl bg-zinc-50 px-3 py-2">
                      <p className="text-xs text-slate-500">{rotuloMedida(nome)}</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatarNumero(valor)} cm
                        <Variacao atual={valor} anterior={anterior?.measurements[nome]} unidade="cm" />
                      </p>
                    </div>
                  ))}
                </div>

                {selecionada.description ? (
                  <p className="mt-4 text-sm text-slate-700">{selecionada.description}</p>
                ) : null}
                {selecionada.notes ? (
                  <p className="mt-2 text-sm text-slate-500">Obs.: {selecionada.notes}</p>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Histórico</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {avaliacoes.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelecionadaId(item.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                          item.id === selecionada.id
                            ? 'border-emerald-600 bg-emerald-50/50'
                            : 'border-slate-200 hover:border-emerald-600/40'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <SeloTipo tipo={item.tipo} />
                          {formatarDataBr(item.assessmentDate)}
                        </span>
                        <span className="font-semibold text-slate-700">{formatarNumero(item.weight)} kg</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
