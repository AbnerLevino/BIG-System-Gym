import { useState } from 'react'
import {
  ArrowRight,
  Backpack,
  BicepsFlexed,
  ChevronDown,
  Dumbbell,
  Footprints,
  Grid3x3,
  HandMetal,
  Shirt,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Modal } from '../../components/common'
import { obterExercicios } from '../../data'
import type { Exercicio } from '../../types'

const LABEL_GRUPO_MUSCULAR: Record<Exercicio['grupoMuscular'], string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombro: 'Ombro',
  braco: 'Braço',
  abdomen: 'Abdômen',
  perna: 'Perna',
}

const ICONE_GRUPO_MUSCULAR: Record<Exercicio['grupoMuscular'], LucideIcon> = {
  peito: Shirt,
  costas: Backpack,
  ombro: HandMetal,
  braco: BicepsFlexed,
  abdomen: Grid3x3,
  perna: Footprints,
}

const GRUPOS_ORDEM: Exercicio['grupoMuscular'][] = ['peito', 'costas', 'ombro', 'braco', 'abdomen', 'perna']

// Nível de dificuldade usa cor semântica (farol verde/âmbar/vermelho), não a cor
// da marca — assim a cor comunica o nível em vez de só decorar o card.
const NIVEL_CONFIG: Record<Exercicio['nivelDificuldade'], { label: string; dot: string; chip: string }> = {
  iniciante: { label: 'Iniciante', dot: 'bg-emerald-500', chip: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  intermediario: { label: 'Intermediário', dot: 'bg-amber-500', chip: 'border-amber-200 bg-amber-50 text-amber-700' },
  avancado: { label: 'Avançado', dot: 'bg-rose-500', chip: 'border-rose-200 bg-rose-50 text-rose-700' },
}

function ChipDificuldade({ nivel }: { nivel: Exercicio['nivelDificuldade'] }) {
  const config = NIVEL_CONFIG[nivel]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.chip}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function ChipEquipamento({ equipamento }: { equipamento: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
      <Dumbbell size={12} className="shrink-0" />
      {equipamento}
    </span>
  )
}

function GrupoMuscularLabel({ grupo }: { grupo: Exercicio['grupoMuscular'] }) {
  const Icone = ICONE_GRUPO_MUSCULAR[grupo]
  return (
    <span className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-wide text-emerald-700">
      <Icone size={20} className="shrink-0" />
      {LABEL_GRUPO_MUSCULAR[grupo]}
    </span>
  )
}

function ExercicioImagem({ exercicio, alto }: { exercicio: Exercicio; alto?: boolean }) {
  if (!exercicio.animacaoUrl) return null
  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-900 ${alto ? 'aspect-[4/3]' : 'aspect-square'} w-full`}
    >
      <img src={exercicio.animacaoUrl} alt={exercicio.nome} className="h-full w-full object-contain" />
    </div>
  )
}

// Linha compacta pro dropdown: imagem pequena na lateral (não em cima, como no
// modal) + nome/chips no meio + "Ver mais" pra abrir o detalhe completo. Com 100
// exercícios agrupados, o card grande de antes não cabe — isso é pra navegar
// rápido, o modal continua sendo onde o exercício aparece por inteiro.
function ExercicioLinha({ exercicio, onAbrir }: { exercicio: Exercicio; onAbrir: (exercicio: Exercicio) => void }) {
  return (
    <div
      onClick={() => onAbrir(exercicio)}
      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-900">
        {exercicio.animacaoUrl ? (
          <img src={exercicio.animacaoUrl} alt={exercicio.nome} className="h-full w-full object-contain" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-zinc-900">{exercicio.nome}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <ChipDificuldade nivel={exercicio.nivelDificuldade} />
          <ChipEquipamento equipamento={exercicio.equipamento} />
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onAbrir(exercicio)
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
      >
        Ver mais
        <ArrowRight size={12} className="shrink-0" />
      </button>
    </div>
  )
}

function ExercicioDetalheModal({ exercicio, onClose }: { exercicio: Exercicio | null; onClose: () => void }) {
  return (
    <Modal open={exercicio !== null} title={exercicio?.nome ?? ''} onClose={onClose} size="lg">
      {exercicio ? (
        <div className="flex flex-col gap-5">
          <ExercicioImagem exercicio={exercicio} alto />
          <div className="flex items-center gap-2">
            <ChipDificuldade nivel={exercicio.nivelDificuldade} />
            <ChipEquipamento equipamento={exercicio.equipamento} />
          </div>
          <div>
            <GrupoMuscularLabel grupo={exercicio.grupoMuscular} />
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{exercicio.descricao}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Video size={16} className="shrink-0" />
              Vídeo-aula
            </div>
            {exercicio.videoUrl ? (
              <a
                href={exercicio.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Assistir vídeo-aula
              </a>
            ) : (
              <p className="text-sm text-slate-500">Vídeo-aula ainda não disponível para este exercício.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export function SubscriberTreinoPage() {
  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const exercicios = obterExercicios()

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-zinc-800">Treino</h1>
        <button
          type="button"
          onClick={() => setDropdownAberto((aberto) => !aberto)}
          aria-expanded={dropdownAberto}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Exercícios
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform duration-200 ${dropdownAberto ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {dropdownAberto ? (
        <div className="mb-6 max-h-[32rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {GRUPOS_ORDEM.map((grupo) => {
            const itensDoGrupo = exercicios.filter((exercicio) => exercicio.grupoMuscular === grupo)
            if (itensDoGrupo.length === 0) return null
            return (
              <div key={grupo} className="mb-5 last:mb-0">
                <GrupoMuscularLabel grupo={grupo} />
                <div className="mt-2 flex flex-col divide-y divide-slate-100">
                  {itensDoGrupo.map((exercicio) => (
                    <ExercicioLinha key={exercicio.id} exercicio={exercicio} onAbrir={setExercicioSelecionado} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Abra "Exercícios" pra escolher o que vai treinar.</p>
      )}

      <ExercicioDetalheModal exercicio={exercicioSelecionado} onClose={() => setExercicioSelecionado(null)} />
    </AppLayout>
  )
}
