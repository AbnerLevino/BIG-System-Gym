// RF-ALU-06/07/08: o aluno responde um questionário (objetivo, experiência, grupos
// musculares e meta) e vê os exercícios recomendados — a união dos exercícios dos
// grupos escolhidos, sem repetir, limitada pelo nível de experiência
// (regra em recomendacaoService.ts). Daqui dá pra mandar um exercício pro treino.
import { useState } from 'react'
import { Activity, Check, Flame, HeartPulse, RotateCcw, Target, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Card, Input } from '../../components/common'
import {
  adicionarExercicioAoTreino,
  calcularProgressoMeta,
  obterMetasPorAluno,
  obterObjetivoDoAluno,
  obterTreinoDoAluno,
  recomendarExercicios,
  responderQuestionarioObjetivos,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import type {
  DiaSemana,
  Exercicio,
  GrupoMuscular,
  NivelDificuldadeExercicio,
  StatusMeta,
  TipoMeta,
  TipoObjetivo,
} from '../../types'
import { ChipDificuldade, ChipEquipamento, ExercicioDetalheModal } from './SubscriberTreinoPage'
import { GRUPOS_ORDEM, ICONE_GRUPO_MUSCULAR, LABEL_DIA_SEMANA, LABEL_GRUPO_MUSCULAR } from './rotulosExercicio'
import { formatarDataBr } from '../../utils/formatacao'

const OBJETIVOS: { id: TipoObjetivo; label: string; descricao: string; icon: LucideIcon }[] = [
  { id: 'perderPeso', label: 'Perder peso', descricao: 'Reduzir gordura e peso corporal', icon: Flame },
  { id: 'ganharMassa', label: 'Ganhar massa', descricao: 'Aumentar força e massa muscular', icon: TrendingUp },
  { id: 'condicionamento', label: 'Condicionamento', descricao: 'Mais fôlego e resistência', icon: Activity },
  { id: 'saude', label: 'Saúde e bem-estar', descricao: 'Manter o corpo ativo', icon: HeartPulse },
]

const NIVEIS: { id: NivelDificuldadeExercicio; label: string; descricao: string }[] = [
  { id: 'iniciante', label: 'Iniciante', descricao: 'Estou começando ou voltando agora' },
  { id: 'intermediario', label: 'Intermediário', descricao: 'Treino há alguns meses com regularidade' },
  { id: 'avancado', label: 'Avançado', descricao: 'Treino há mais de um ano, domino a técnica' },
]

const TIPOS_META: { id: TipoMeta; label: string; unidade: string; dica: string }[] = [
  { id: 'weight', label: 'Peso', unidade: 'kg', dica: 'Peso que você quer alcançar' },
  { id: 'frequency', label: 'Frequência', unidade: 'check-ins', dica: 'Quantas vezes quer vir à academia' },
  { id: 'measurement', label: 'Medida corporal', unidade: 'cm', dica: 'Ex: cintura em centímetros' },
]

const LABEL_OBJETIVO = Object.fromEntries(OBJETIVOS.map((item) => [item.id, item.label])) as Record<TipoObjetivo, string>
const LABEL_NIVEL = Object.fromEntries(NIVEIS.map((item) => [item.id, item.label])) as Record<NivelDificuldadeExercicio, string>

const LABEL_STATUS_META: Record<StatusMeta, { label: string; chip: string }> = {
  inProgress: { label: 'Em andamento', chip: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Concluída', chip: 'bg-emerald-50 text-emerald-700' },
  late: { label: 'Prazo vencido', chip: 'bg-rose-50 text-rose-700' },
}

type Passo = 'objetivo' | 'nivel' | 'grupos' | 'meta'
const PASSOS: Passo[] = ['objetivo', 'nivel', 'grupos', 'meta']
const TITULO_PASSO: Record<Passo, string> = {
  objetivo: 'Qual é o seu objetivo?',
  nivel: 'Qual é a sua experiência com treino?',
  grupos: 'Quais grupos musculares você quer melhorar?',
  meta: 'Defina uma meta',
}


function OpcaoCartao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
        ativo ? 'border-emerald-700 bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-600/40'
      }`}
    >
      {children}
      <span
        className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          ativo ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'
        }`}
      >
        {ativo ? <Check size={12} /> : null}
      </span>
    </button>
  )
}

// ---------- Questionário ----------

interface QuestionarioProps {
  alunoId: string
  onConcluir: () => void
  onCancelar?: () => void
}

function Questionario({ alunoId, onConcluir, onCancelar }: QuestionarioProps) {
  const anterior = obterObjetivoDoAluno(alunoId)
  const [passo, setPasso] = useState<Passo>('objetivo')
  const [objetivo, setObjetivo] = useState<TipoObjetivo | null>(anterior?.objetivo ?? null)
  const [nivel, setNivel] = useState<NivelDificuldadeExercicio | null>(anterior?.nivelExperiencia ?? null)
  const [grupos, setGrupos] = useState<GrupoMuscular[]>(anterior?.gruposMusculares ?? [])
  const [tipoMeta, setTipoMeta] = useState<TipoMeta>(anterior?.objetivo === 'condicionamento' ? 'frequency' : 'weight')
  const [alvo, setAlvo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')

  const indice = PASSOS.indexOf(passo)
  const hoje = new Date().toISOString().slice(0, 10)
  const tipoMetaInfo = TIPOS_META.find((item) => item.id === tipoMeta)!

  function alternarGrupo(grupo: GrupoMuscular) {
    setGrupos((atuais) => (atuais.includes(grupo) ? atuais.filter((item) => item !== grupo) : [...atuais, grupo]))
  }

  const podeAvancar =
    (passo === 'objetivo' && objetivo !== null) ||
    (passo === 'nivel' && nivel !== null) ||
    (passo === 'grupos' && grupos.length > 0) ||
    passo === 'meta'

  function avancar() {
    setErro('')
    if (passo !== 'meta') {
      setPasso(PASSOS[indice + 1])
      return
    }
    const valor = Number(alvo)
    if (!valor || valor <= 0) {
      setErro('Informe um valor de meta maior que zero.')
      return
    }
    if (!prazo || prazo < hoje) {
      setErro('O prazo da meta precisa ser hoje ou uma data futura.')
      return
    }
    responderQuestionarioObjetivos(alunoId, {
      objetivo: objetivo!,
      nivelExperiencia: nivel!,
      gruposMusculares: GRUPOS_ORDEM.filter((grupo) => grupos.includes(grupo)),
      meta: {
        description: descricao.trim() || `${LABEL_OBJETIVO[objetivo!]}: ${valor} ${tipoMetaInfo.unidade}`,
        type: tipoMeta,
        targetValue: valor,
        deadline: prazo,
      },
    })
    onConcluir()
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Passo {indice + 1} de {PASSOS.length}
        </p>
        <div className="flex gap-1.5">
          {PASSOS.map((item, i) => (
            <span key={item} className={`h-1.5 w-8 rounded-full ${i <= indice ? 'bg-emerald-700' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
      <h2 className="mt-3 font-heading text-xl font-semibold text-slate-900">{TITULO_PASSO[passo]}</h2>

      <div className="mt-5">
        {passo === 'objetivo' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {OBJETIVOS.map((item) => {
              const Icone = item.icon
              return (
                <OpcaoCartao key={item.id} ativo={objetivo === item.id} onClick={() => setObjetivo(item.id)}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icone size={20} />
                  </span>
                  <span className="pr-6">
                    <span className="block font-semibold text-slate-900">{item.label}</span>
                    <span className="block text-sm text-slate-500">{item.descricao}</span>
                  </span>
                </OpcaoCartao>
              )
            })}
          </div>
        ) : null}

        {passo === 'nivel' ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {NIVEIS.map((item) => (
              <OpcaoCartao key={item.id} ativo={nivel === item.id} onClick={() => setNivel(item.id)}>
                <span className="pr-6">
                  <span className="block font-semibold text-slate-900">{item.label}</span>
                  <span className="block text-sm text-slate-500">{item.descricao}</span>
                </span>
              </OpcaoCartao>
            ))}
            <p className="text-xs text-slate-500 sm:col-span-3">
              Usamos isso para não recomendar exercícios acima do seu nível.
            </p>
          </div>
        ) : null}

        {passo === 'grupos' ? (
          <div>
            {/* RF-ALU-07: seleção múltipla simultânea. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {GRUPOS_ORDEM.map((grupo) => {
                const Icone = ICONE_GRUPO_MUSCULAR[grupo]
                return (
                  <OpcaoCartao key={grupo} ativo={grupos.includes(grupo)} onClick={() => alternarGrupo(grupo)}>
                    <Icone size={20} className="mt-0.5 shrink-0 text-emerald-700" />
                    <span className="pr-6 font-semibold text-slate-900">{LABEL_GRUPO_MUSCULAR[grupo]}</span>
                  </OpcaoCartao>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {grupos.length === 0 ? 'Escolha um ou mais grupos.' : `${grupos.length} selecionado(s).`}
            </p>
          </div>
        ) : null}

        {passo === 'meta' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {TIPOS_META.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTipoMeta(item.id)}
                  aria-pressed={tipoMeta === item.id}
                  className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
                    tipoMeta === item.id
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="alvo"
                label={`Alvo (${tipoMetaInfo.unidade})`}
                type="number"
                min={0}
                step="0.1"
                value={alvo}
                onChange={(e) => setAlvo(e.target.value)}
                placeholder={tipoMetaInfo.dica}
              />
              <Input id="prazo" label="Prazo" type="date" min={hoje} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
            <Input
              id="descricao"
              label="Descrição (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={objetivo ? `Ex: ${LABEL_OBJETIVO[objetivo]} até o verão` : ''}
            />
            <p className="text-xs text-slate-500">
              {tipoMeta === 'measurement'
                ? 'Medidas são acompanhadas nas avaliações físicas com o profissional.'
                : 'Sem personal, o sistema acompanha sozinho: frequência pelos seus check-ins, peso pela sua avaliação física mais recente.'}
            </p>
          </div>
        ) : null}
      </div>

      {erro ? <p className="mt-4 text-sm text-red-600">{erro}</p> : null}

      <div className="mt-6 flex items-center justify-between">
        {indice > 0 ? (
          <Button variant="secondary" onClick={() => setPasso(PASSOS[indice - 1])}>
            Voltar
          </Button>
        ) : onCancelar ? (
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={avancar} disabled={!podeAvancar}>
          {passo === 'meta' ? 'Ver meus exercícios' : 'Continuar'}
        </Button>
      </div>
    </Card>
  )
}

// ---------- Resultado ----------

function CartaoRecomendado({ exercicio, onAbrir }: { exercicio: Exercicio; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-md"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-900">
        {exercicio.animacaoUrl ? (
          <img src={exercicio.animacaoUrl} alt={exercicio.nome} className="h-full w-full object-contain" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{exercicio.nome}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{exercicio.descricao}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ChipDificuldade nivel={exercicio.nivelDificuldade} />
          <ChipEquipamento equipamento={exercicio.equipamento} />
        </div>
      </div>
    </button>
  )
}

export function SubscriberObjetivosPage() {
  const alunoId = useAuthStore((state) => state.usuarioAtual!.refId)
  const [versao, setVersao] = useState(0)
  const [refazendo, setRefazendo] = useState(false)
  const [exercicioAberto, setExercicioAberto] = useState<Exercicio | null>(null)
  const [aviso, setAviso] = useState('')

  const objetivo = obterObjetivoDoAluno(alunoId)
  const meta = objetivo?.metaId ? obterMetasPorAluno(alunoId).find((item) => item.id === objetivo.metaId) : undefined
  const progresso = meta ? calcularProgressoMeta(meta) : undefined
  const recomendados = objetivo ? recomendarExercicios(objetivo.gruposMusculares, objetivo.nivelExperiencia) : []
  const unidadeMeta = meta ? TIPOS_META.find((item) => item.id === meta.type)?.unidade : ''

  function handleAdicionar(exercicioId: string, dia: DiaSemana, sets: number, reps: number) {
    const treino = obterTreinoDoAluno(alunoId)
    adicionarExercicioAoTreino(treino.id, exercicioId, dia, sets, reps)
    setExercicioAberto(null)
    setAviso(`Adicionado ao seu treino de ${LABEL_DIA_SEMANA[dia]}.`)
    setTimeout(() => setAviso(''), 3000)
  }

  return (
    <AppLayout>
      <div key={versao} className="mx-auto max-w-5xl">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Objetivos</h1>
        <p className="text-sm text-slate-500">Conte o que você quer alcançar e veja os exercícios indicados para você.</p>

        <div className="mt-6">
          {!objetivo || refazendo ? (
            <Questionario
              alunoId={alunoId}
              onConcluir={() => {
                setRefazendo(false)
                setVersao((atual) => atual + 1)
              }}
              onCancelar={objetivo ? () => setRefazendo(false) : undefined}
            />
          ) : (
            <>
              {/* Resumo do questionário + meta */}
              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-zinc-50/60 p-5 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Seu objetivo</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-slate-900">{LABEL_OBJETIVO[objetivo.objetivo]}</p>
                  <p className="text-sm text-slate-500">Nível {LABEL_NIVEL[objetivo.nivelExperiencia].toLowerCase()}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {objetivo.gruposMusculares.map((grupo) => (
                      <span key={grupo} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        {LABEL_GRUPO_MUSCULAR[grupo]}
                      </span>
                    ))}
                  </div>
                </div>
                {meta && progresso ? (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Target size={12} /> Sua meta
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{meta.description}</p>
                    <p className="text-sm text-slate-500">
                      Alvo {meta.targetValue} {unidadeMeta} até {formatarDataBr(meta.deadline)}
                    </p>
                    {progresso.valorAtual !== undefined ? (
                      <p className="text-sm text-slate-500">
                        Hoje: {progresso.valorAtual} {unidadeMeta}
                      </p>
                    ) : null}
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${LABEL_STATUS_META[progresso.status].chip}`}>
                      {LABEL_STATUS_META[progresso.status].label}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-start md:justify-end">
                  <Button variant="secondary" onClick={() => setRefazendo(true)}>
                    <RotateCcw size={14} /> Refazer questionário
                  </Button>
                </div>
              </section>

              {/* RF-ALU-08: recomendados */}
              <section className="mt-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Exercícios recomendados</h2>
                  <p className="text-xs text-slate-500">
                    {recomendados.length} exercícios · até o nível {LABEL_NIVEL[objetivo.nivelExperiencia].toLowerCase()}
                  </p>
                </div>
                {aviso ? (
                  <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{aviso}</p>
                ) : null}

                {recomendados.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 py-10 text-center">
                    <p className="text-sm font-medium text-slate-700">Nenhum exercício encontrado para essa combinação.</p>
                    <p className="mt-1 text-xs text-slate-500">Tente incluir outros grupos musculares.</p>
                  </div>
                ) : (
                  objetivo.gruposMusculares.map((grupo) => {
                    const doGrupo = recomendados.filter((exercicio) => exercicio.grupoMuscular === grupo)
                    if (doGrupo.length === 0) return null
                    const Icone = ICONE_GRUPO_MUSCULAR[grupo]
                    return (
                      <div key={grupo} className="mt-6">
                        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                          <Icone size={16} /> {LABEL_GRUPO_MUSCULAR[grupo]}
                          <span className="font-normal normal-case text-slate-400">· {doGrupo.length}</span>
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {doGrupo.map((exercicio) => (
                            <CartaoRecomendado key={exercicio.id} exercicio={exercicio} onAbrir={() => setExercicioAberto(exercicio)} />
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <ExercicioDetalheModal
        exercicio={exercicioAberto}
        onClose={() => setExercicioAberto(null)}
        diaPadrao="segunda"
        onAdicionar={handleAdicionar}
      />
    </AppLayout>
  )
}
