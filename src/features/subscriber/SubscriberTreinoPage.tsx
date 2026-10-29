import { useState } from 'react'
import { ArrowRight, Backpack, BicepsFlexed, Dumbbell, Footprints, Grid3x3, HandMetal, Shirt, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Modal } from '../../components/common'
import type { Exercicio } from '../../types'

// Mock temporário só pra validar visualmente o formato do Exercicio (GIF real do
// ExerciseDB + descrição) e o grid de lista antes de escrever o script de import
// da Task 1. Os 4 itens reaproveitam o mesmo GIF de placeholder.
const exerciciosMock: Exercicio[] = [
  {
    id: 'supino-inclinado-barra-pegada-media',
    nome: 'Supino inclinado com barra - pegada média',
    descricao:
      'Deitado no banco inclinado, pegada na barra um pouco mais larga que os ombros. Desça a barra devagar até tocar a parte superior do peito, pause e empurre de volta estendendo os braços, contraindo o peitoral no topo do movimento.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/3TZduzM.gif',
  },
  {
    id: 'agachamento-livre-barra',
    nome: 'Agachamento livre com barra',
    descricao:
      'Barra apoiada na parte superior das costas, pés na largura dos ombros. Desça flexionando quadril e joelhos até as coxas ficarem paralelas ao chão, peito erguido e joelhos alinhados com os pés. Suba empurrando o chão com os calcanhares.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/3TZduzM.gif',
  },
  {
    id: 'puxada-frontal-polia',
    nome: 'Puxada frontal na polia',
    descricao:
      'Sentado de frente para o aparelho, pegada aberta na barra. Puxe até a altura do queixo contraindo as costas e levando os cotovelos para baixo. Retorne controlando o peso até o braço estender por completo.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/3TZduzM.gif',
  },
  {
    id: 'elevacao-lateral-halteres',
    nome: 'Elevação lateral com halteres',
    descricao:
      'Em pé, halteres ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros, cotovelos levemente flexionados, sem balançar o tronco. Desça controlando o peso até a posição inicial.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/3TZduzM.gif',
  },
]

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

function BotaoVerMais({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className="group relative mt-auto inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-emerald-700 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-800"
    >
      {/* Auréola: uma única faixa de gradiente (clara → escura → clara), bem mais
          larga que o botão, deslizando devagar de um lado pro outro — um
          movimento só, contínuo, em vez de blobs independentes. */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
        <span className="absolute -left-full h-full w-[300%] animate-aurora-sweep bg-gradient-to-r from-emerald-300 via-emerald-900 to-emerald-300 blur-xl motion-reduce:animate-none" />
      </span>
      <span className="relative inline-flex items-center gap-1.5">
        Ver mais
        <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </span>
    </button>
  )
}

function ExercicioCard({ exercicio, onAbrir }: { exercicio: Exercicio; onAbrir: (exercicio: Exercicio) => void }) {
  return (
    <div
      onClick={() => onAbrir(exercicio)}
      className="flex w-80 cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <ExercicioImagem exercicio={exercicio} />
      <div className="flex items-center gap-2">
        <ChipDificuldade nivel={exercicio.nivelDificuldade} />
        <ChipEquipamento equipamento={exercicio.equipamento} />
      </div>
      <div className="flex flex-col gap-2">
        <GrupoMuscularLabel grupo={exercicio.grupoMuscular} />
        <h2 className="font-heading text-lg font-semibold text-zinc-900">{exercicio.nome}</h2>
        <p className="line-clamp-3 text-sm text-slate-600">{exercicio.descricao}</p>
      </div>
      <BotaoVerMais onClick={() => onAbrir(exercicio)} />
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

  return (
    <AppLayout>
      <h1 className="mb-4 font-heading text-2xl text-zinc-800">Treino</h1>
      <div className="flex flex-wrap gap-4">
        {exerciciosMock.map((exercicio) => (
          <ExercicioCard key={exercicio.id} exercicio={exercicio} onAbrir={setExercicioSelecionado} />
        ))}
      </div>
      <ExercicioDetalheModal exercicio={exercicioSelecionado} onClose={() => setExercicioSelecionado(null)} />
    </AppLayout>
  )
}
