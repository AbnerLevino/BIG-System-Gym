import { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Dumbbell,
  Minus,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Modal } from '../../components/common'
import {
  DIAS_SEMANA,
  adicionarExercicioAoTreino,
  agruparExerciciosPorDia,
  definirRecorrenciaDoTreino,
  definirSemanaDoTreino,
  diaSemanaDeHoje,
  obterExercicios,
  obterTreinoDoAluno,
  removerExercicioDoTreino,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import type { DiaSemana, Exercicio, Treino } from '../../types'
import { GRUPOS_ORDEM, ICONE_GRUPO_MUSCULAR, LABEL_DIA_SEMANA, LABEL_GRUPO_MUSCULAR } from './rotulosExercicio'



// Nível de dificuldade usa cor semântica (farol verde/âmbar/vermelho), não a cor
// da marca — assim a cor comunica o nível em vez de só decorar o card.
const NIVEL_CONFIG: Record<Exercicio['nivelDificuldade'], { label: string; dot: string; chip: string }> = {
  iniciante: { label: 'Iniciante', dot: 'bg-emerald-500', chip: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  intermediario: { label: 'Intermediário', dot: 'bg-amber-500', chip: 'border-amber-200 bg-amber-50 text-amber-700' },
  avancado: { label: 'Avançado', dot: 'bg-rose-500', chip: 'border-rose-200 bg-rose-50 text-rose-700' },
}

export function ChipDificuldade({ nivel }: { nivel: Exercicio['nivelDificuldade'] }) {
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

export function ChipEquipamento({ equipamento }: { equipamento: string }) {
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

// Formulário embutido no modal de detalhe pra escolher dia/séries/repetições e
// jogar o exercício no treino da semana.
function AlocarExercicioForm({
  diaPadrao,
  onAdicionar,
}: {
  diaPadrao: DiaSemana
  onAdicionar: (dia: DiaSemana, sets: number, reps: number) => void
}) {
  const [dia, setDia] = useState<DiaSemana>(diaPadrao)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(12)

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
        <Calendar size={16} className="shrink-0" />
        Adicionar ao treino
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="col-span-3 text-xs font-medium text-slate-600 sm:col-span-1">
          Dia
          <select
            value={dia}
            onChange={(event) => setDia(event.target.value as DiaSemana)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          >
            {DIAS_SEMANA.map((item) => (
              <option key={item} value={item}>
                {LABEL_DIA_SEMANA[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Séries
          <input
            type="number"
            min={1}
            value={sets}
            onChange={(event) => setSets(Number(event.target.value))}
            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Repetições
          <input
            type="number"
            min={1}
            value={reps}
            onChange={(event) => setReps(Number(event.target.value))}
            className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
        </label>
      </div>
      <Button type="button" className="mt-3 w-full justify-center" onClick={() => onAdicionar(dia, sets, reps)}>
        Adicionar
      </Button>
    </div>
  )
}

export function ExercicioDetalheModal({
  exercicio,
  onClose,
  diaPadrao,
  onAdicionar,
}: {
  exercicio: Exercicio | null
  onClose: () => void
  diaPadrao: DiaSemana
  onAdicionar: (exercicioId: string, dia: DiaSemana, sets: number, reps: number) => void
}) {
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
            {/* O catálogo ainda não tem vídeo próprio por exercício (videoUrl vazio);
                enquanto isso, o link abre uma busca pela vídeo-aula do exercício. */}
            <a
              href={
                exercicio.videoUrl ??
                `https://www.youtube.com/results?search_query=${encodeURIComponent(`como fazer ${exercicio.nome}`)}`
              }
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Assistir vídeo-aula
            </a>
          </div>
          <AlocarExercicioForm
            diaPadrao={diaPadrao}
            onAdicionar={(dia, sets, reps) => onAdicionar(exercicio.id, dia, sets, reps)}
          />
        </div>
      ) : null}
    </Modal>
  )
}

// Grade semanal: chips de domingo a sábado (segunda primeiro) com a contagem de
// exercícios de cada dia, e a lista do dia selecionado embaixo.
function GradeSemanal({
  treino,
  diaSelecionado,
  onSelecionarDia,
  exerciciosPorId,
  onRemover,
}: {
  treino: Treino
  diaSelecionado: DiaSemana
  onSelecionarDia: (dia: DiaSemana) => void
  exerciciosPorId: Map<string, Exercicio>
  onRemover: (exercicioId: string, dia: DiaSemana) => void
}) {
  const porDia = agruparExerciciosPorDia(treino)
  const itensDoDia = porDia[diaSelecionado]

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2">
        {DIAS_SEMANA.map((dia) => {
          const quantidade = porDia[dia].length
          const ativo = dia === diaSelecionado
          return (
            <button
              key={dia}
              type="button"
              onClick={() => onSelecionarDia(dia)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                ativo
                  ? 'border-emerald-700 bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {LABEL_DIA_SEMANA[dia]}
              {quantidade > 0 ? (
                <span className={`rounded-full px-1.5 text-[10px] ${ativo ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {quantidade}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {itensDoDia.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum exercício nesse dia ainda. Abra "Exercícios" e escolha um.</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {itensDoDia.map((item, index) => {
            const exercicio = exerciciosPorId.get(item.exercicioId)
            if (!exercicio) return null
            return (
              <div key={`${item.exercicioId}-${index}`} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">{exercicio.nome}</p>
                  <p className="text-xs text-slate-500">
                    {item.sets}x{item.reps}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemover(item.exercicioId, diaSelecionado)}
                  aria-label="Remover exercício"
                  className="shrink-0 text-slate-400 transition-colors hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ControleRecorrencia({
  treino,
  onAlterarRecorrencia,
  onAlterarSemana,
}: {
  treino: Treino
  onAlterarRecorrencia: (recorrente: boolean) => void
  onAlterarSemana: (week: number) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onAlterarRecorrencia(true)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            treino.recorrente ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Recorrente
        </button>
        <button
          type="button"
          onClick={() => onAlterarRecorrencia(false)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            !treino.recorrente ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Por semana
        </button>
      </div>
      {!treino.recorrente ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onAlterarSemana(treino.week - 1)}
            aria-label="Semana anterior"
            className="text-slate-400 hover:text-slate-700"
          >
            <Minus size={14} />
          </button>
          Semana {treino.week}
          <button
            type="button"
            onClick={() => onAlterarSemana(treino.week + 1)}
            aria-label="Próxima semana"
            className="text-slate-400 hover:text-slate-700"
          >
            <Plus size={14} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function SubscriberTreinoPage() {
  const alunoId = useAuthStore((state) => state.usuarioAtual!.refId)
  const [exercicioSelecionado, setExercicioSelecionado] = useState<Exercicio | null>(null)
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(diaSemanaDeHoje)
  const [treino, setTreino] = useState(() => obterTreinoDoAluno(alunoId))

  const exercicios = obterExercicios()
  const exerciciosPorId = new Map(exercicios.map((exercicio) => [exercicio.id, exercicio]))

  const recarregarTreino = () => setTreino(obterTreinoDoAluno(alunoId))

  const handleAdicionar = (exercicioId: string, dia: DiaSemana, sets: number, reps: number) => {
    adicionarExercicioAoTreino(treino.id, exercicioId, dia, sets, reps)
    recarregarTreino()
    setDiaSelecionado(dia)
    setExercicioSelecionado(null)
  }

  const handleRemover = (exercicioId: string, dia: DiaSemana) => {
    removerExercicioDoTreino(treino.id, exercicioId, dia)
    recarregarTreino()
  }

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

      <ControleRecorrencia
        treino={treino}
        onAlterarRecorrencia={(recorrente) => {
          definirRecorrenciaDoTreino(treino.id, recorrente)
          recarregarTreino()
        }}
        onAlterarSemana={(week) => {
          definirSemanaDoTreino(treino.id, week)
          recarregarTreino()
        }}
      />

      <GradeSemanal
        treino={treino}
        diaSelecionado={diaSelecionado}
        onSelecionarDia={setDiaSelecionado}
        exerciciosPorId={exerciciosPorId}
        onRemover={handleRemover}
      />

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
      ) : null}

      <ExercicioDetalheModal
        exercicio={exercicioSelecionado}
        onClose={() => setExercicioSelecionado(null)}
        diaPadrao={diaSelecionado}
        onAdicionar={handleAdicionar}
      />
    </AppLayout>
  )
}
