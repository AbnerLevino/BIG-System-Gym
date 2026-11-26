// Central da Recepção — tela inicial do atendente. Organizada pela rotina do
// balcão: o que está acontecendo (indicadores), o que fazer (ações rápidas), o que
// precisa de atenção e o que acabou de acontecer (movimentação). Todos os números
// vêm de obterResumoRecepcao() (recepcaoService.ts) — nada é mockado aqui.
import { useCallback, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Ban,
  CreditCard,
  DoorOpen,
  RefreshCw,
  ScanFace,
  Search,
  UserPlus,
  UserX,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Modal } from '../../components/common'
import {
  Abas,
  AcaoRapida,
  AcessoRapido,
  CabecalhoCentral,
  EstadoVazio,
  FaixaIndicadores,
  Indicador,
  ItemAluno,
} from '../../components/painel'
import {
  dataLocalISO,
  obterAlunoPorId,
  obterResumoRecepcao,
  type Movimentacao,
  type Pendencia,
  type PrioridadePendencia,
  type TipoMovimentacao,
} from '../../data'
import { useAuthStore } from '../../store/authStore'
import { AlunoDetalhe } from './AlunoDetalhe'
import { BuscaAlunoModal } from './BuscaAlunoModal'
import { CadastroAlunoFluxo } from './CadastroAlunoFluxo'
import { SelecionarCobrancaModal } from './SelecionarCobrancaModal'

// ---------- Atenção necessária ----------

const ESTILO_PRIORIDADE: Record<PrioridadePendencia, { label: string; barra: string; chip: string }> = {
  alta: { label: 'Urgente', barra: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700' },
  media: { label: 'Hoje', barra: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  baixa: { label: 'Em breve', barra: 'bg-slate-300', chip: 'bg-slate-100 text-slate-600' },
}

type AbaAtencao = 'tudo' | 'pendencias' | 'renovacoes'

const ABAS_ATENCAO: { id: AbaAtencao; label: string }[] = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'pendencias', label: 'Pendências' },
  { id: 'renovacoes', label: 'Renovações' },
]

// ---------- Movimentação recente ----------

const ESTILO_MOVIMENTACAO: Record<TipoMovimentacao, { icon: LucideIcon; classes: string }> = {
  checkin: { icon: DoorOpen, classes: 'bg-emerald-50 text-emerald-700' },
  checkinBloqueado: { icon: Ban, classes: 'bg-rose-50 text-rose-600' },
  pagamento: { icon: Wallet, classes: 'bg-emerald-50 text-emerald-700' },
  matricula: { icon: UserPlus, classes: 'bg-slate-100 text-slate-600' },
  trocaPlano: { icon: RefreshCw, classes: 'bg-amber-50 text-amber-700' },
  cancelamento: { icon: UserX, classes: 'bg-slate-100 text-slate-500' },
}

// "hoje, 14:32" quando há horário; "hoje" / "ontem" / "12/11" quando a origem só tem data.
function quandoAconteceu(movimentacao: Movimentacao): string {
  const data = new Date(movimentacao.quando)
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(hoje.getDate() - 1)

  const dia = dataLocalISO(data)
  let rotulo: string
  if (dia === dataLocalISO(hoje)) rotulo = 'hoje'
  else if (dia === dataLocalISO(ontem)) rotulo = 'ontem'
  else rotulo = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  if (!movimentacao.temHorario) return rotulo
  return `${rotulo}, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

// ---------- Peças da página ----------

interface ItemAtencaoProps {
  pendencia: Pendencia
  onAbrirAluno: () => void
  onReceber: () => void
}

function ItemAtencao({ pendencia, onAbrirAluno, onReceber }: ItemAtencaoProps) {
  const estilo = ESTILO_PRIORIDADE[pendencia.prioridade]
  const ehCobranca = pendencia.pagamento !== undefined
  return (
    <ItemAluno
      aluno={obterAlunoPorId(pendencia.alunoId)}
      nome={pendencia.nomeAluno}
      descricao={pendencia.descricao}
      descricaoClasses={pendencia.tipo === 'atrasado' ? 'text-rose-600' : undefined}
      selo={{ label: estilo.label, classes: estilo.chip }}
      barra={estilo.barra}
      acao={{ label: ehCobranca ? 'Receber' : 'Cadastrar rosto', onClick: ehCobranca ? onReceber : onAbrirAluno }}
      onAbrir={onAbrirAluno}
    />
  )
}

// ---------- Página ----------

export function AttendantDashboardPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const navigate = useNavigate()

  const [resumo, setResumo] = useState(obterResumoRecepcao)
  const [abaAtencao, setAbaAtencao] = useState<AbaAtencao>('tudo')
  const [buscando, setBuscando] = useState(false)
  const [escolhendoCobranca, setEscolhendoCobranca] = useState(false)

  // Aluno aberto no modal fica na URL (?aluno=id): dá pra voltar do pagamento ou
  // do cadastro direto pra ficha, e o "voltar" do navegador fecha o modal.
  const [searchParams, setSearchParams] = useSearchParams()
  const alunoAbertoId = searchParams.get('aluno')
  const abrirAluno = (id: string) => setSearchParams({ aluno: id })
  const fecharAluno = () => setSearchParams({})

  // Cadastro também fica na URL (?cadastro=novo[&plano=id]) — é assim que o
  // "Matricular neste plano" do catálogo de planos abre o modal já no plano.
  const cadastroAberto = searchParams.get('cadastro') === 'novo'
  const planoInicialId = searchParams.get('plano')
  const cadastroEmAndamento = useRef(false)
  const marcarCadastroEmAndamento = useCallback((emAndamento: boolean) => {
    cadastroEmAndamento.current = emAndamento
  }, [])
  const recarregarResumo = useCallback(() => setResumo(obterResumoRecepcao()), [])

  function abrirCadastro() {
    setSearchParams({ cadastro: 'novo' })
  }

  function fecharCadastro() {
    if (cadastroEmAndamento.current && !window.confirm('Descartar o cadastro em andamento?')) return
    cadastroEmAndamento.current = false
    setSearchParams({})
  }

  const itensAtencao =
    abaAtencao === 'pendencias' ? resumo.pendencias : abaAtencao === 'renovacoes' ? resumo.renovacoes : resumo.atencao
  const atrasados = resumo.pendencias.filter((item) => item.tipo === 'atrasado').length
  const semRosto = resumo.pendencias.length - atrasados
  const entradasHoje = resumo.checkinsHoje + resumo.checkinsBloqueadosHoje

  return (
    <AppLayout>
      {/* A. Saudação e contexto */}
      <CabecalhoCentral
        nome={usuarioAtual?.nome ?? ''}
        subtitulo="Vamos organizar o dia?"
        contexto={`${resumo.alunosAtivos} ${resumo.alunosAtivos === 1 ? 'aluno ativo' : 'alunos ativos'}${
          resumo.visitasTeste > 0
            ? ` · ${resumo.visitasTeste} ${resumo.visitasTeste === 1 ? 'visita teste' : 'visitas teste'}`
            : ''
        }`}
      />

      {/* B. Indicadores operacionais — uma faixa só, dividida em três */}
      <FaixaIndicadores>
        <Indicador
          icon={ScanFace}
          iconClasses="bg-emerald-50 text-emerald-700"
          valor={resumo.checkinsHoje}
          titulo={resumo.checkinsHoje === 1 ? 'check-in hoje' : 'check-ins hoje'}
          contexto={
            entradasHoje === 0
              ? 'Nenhuma entrada registrada ainda hoje'
              : resumo.checkinsBloqueadosHoje > 0
                ? `${resumo.checkinsBloqueadosHoje} ${resumo.checkinsBloqueadosHoje === 1 ? 'entrada bloqueada' : 'entradas bloqueadas'} na catraca`
                : 'Todas as entradas foram liberadas'
          }
        />
        <Indicador
          icon={RefreshCw}
          iconClasses="bg-amber-50 text-amber-600"
          valor={resumo.renovacoes.length}
          titulo={resumo.renovacoes.length === 1 ? 'renovação' : 'renovações'}
          contexto="Planos que vencem nos próximos 7 dias"
        />
        <Indicador
          icon={AlertTriangle}
          iconClasses="bg-rose-50 text-rose-600"
          valor={resumo.pendencias.length}
          titulo={resumo.pendencias.length === 1 ? 'pendência' : 'pendências'}
          contexto={
            resumo.pendencias.length === 0
              ? 'Nada pendente por aqui'
              : [atrasados > 0 ? `${atrasados} em atraso` : '', semRosto > 0 ? `${semRosto} sem Face ID` : '']
                  .filter(Boolean)
                  .join(' · ')
          }
        />
      </FaixaIndicadores>

      {/* C. Acesso rápido — só rotas e fluxos que já existem */}
      <AcessoRapido>
          <AcaoRapida
            destaque
            icon={UserPlus}
            titulo="Novo aluno"
            descricao="Cadastro, plano, primeira mensalidade e rosto"
            onClick={abrirCadastro}
          />
          <AcaoRapida
            icon={ScanFace}
            titulo="Registrar entrada"
            descricao="Check-in por reconhecimento facial"
            onClick={() => navigate('/atendente/checkin')}
          />
          <AcaoRapida
            icon={CreditCard}
            titulo="Registrar pagamento"
            descricao="Receber mensalidade em aberto no balcão"
            onClick={() => setEscolhendoCobranca(true)}
          />
          <AcaoRapida
            icon={Search}
            titulo="Consultar aluno"
            descricao="Buscar por nome, CPF ou e-mail"
            onClick={() => setBuscando(true)}
          />
      </AcessoRapido>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* D. Atenção necessária */}
        <section aria-label="Atenção necessária" className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Atenção necessária</h2>
            <Abas abas={ABAS_ATENCAO} ativa={abaAtencao} onTrocar={setAbaAtencao} />
          </div>

          {itensAtencao.length === 0 ? (
            <EstadoVazio titulo="Tudo certo por aqui." descricao="Nenhum aluno precisa de atenção nesta lista agora." />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {itensAtencao.map((pendencia) => (
                <ItemAtencao
                  key={pendencia.id}
                  pendencia={pendencia}
                  onAbrirAluno={() => abrirAluno(pendencia.alunoId)}
                  onReceber={() => navigate(`/atendente/pagamento/${pendencia.alunoId}`)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* E. Movimentação recente */}
        <section aria-label="Movimentação recente" className="lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Movimentação recente</h2>
          {resumo.movimentacoes.length === 0 ? (
            <EstadoVazio titulo="Nenhuma movimentação ainda." descricao="Check-ins, pagamentos e matrículas aparecem aqui." />
          ) : (
            <ol className="relative mt-4">
              {/* Linha do tempo atrás dos ícones */}
              <span className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200" aria-hidden />
              {resumo.movimentacoes.map((movimentacao) => {
                const estilo = ESTILO_MOVIMENTACAO[movimentacao.tipo]
                const Icone = estilo.icon
                return (
                  <li key={movimentacao.id}>
                    <button
                      type="button"
                      onClick={() => abrirAluno(movimentacao.alunoId)}
                      className="group relative flex w-full items-start gap-3 rounded-xl py-2.5 pr-2 text-left"
                    >
                      <span
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${estilo.classes}`}
                      >
                        <Icone size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                          {movimentacao.nomeAluno}
                        </p>
                        <p className="truncate text-xs text-slate-500">{movimentacao.descricao}</p>
                      </div>
                      <span className="shrink-0 pt-0.5 text-xs text-slate-400">{quandoAconteceu(movimentacao)}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      <BuscaAlunoModal
        open={buscando}
        onClose={() => setBuscando(false)}
        onSelecionar={(id) => {
          setBuscando(false)
          abrirAluno(id)
        }}
      />

      <SelecionarCobrancaModal open={escolhendoCobranca} onClose={() => setEscolhendoCobranca(false)} />

      <Modal open={cadastroAberto} title="Cadastrar aluno" size="xl" onClose={fecharCadastro}>
        {cadastroAberto ? (
          <CadastroAlunoFluxo
            planoInicialId={planoInicialId}
            onEmAndamento={marcarCadastroEmAndamento}
            onAlterado={recarregarResumo}
            onVerFicha={(id) => {
              cadastroEmAndamento.current = false
              abrirAluno(id)
            }}
            onFechar={() => {
              cadastroEmAndamento.current = false
              setSearchParams({})
            }}
          />
        ) : null}
      </Modal>

      <Modal open={alunoAbertoId !== null} title="Ficha do aluno" size="xl" onClose={fecharAluno}>
        {alunoAbertoId ? (
          // key: trocar de aluno recria o componente (zera modo de edição etc.).
          <AlunoDetalhe key={alunoAbertoId} alunoId={alunoAbertoId} onAlterado={recarregarResumo} />
        ) : null}
      </Modal>
    </AppLayout>
  )
}
