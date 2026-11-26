// Central do profissional — tela inicial, no mesmo formato da Central da Recepção:
// saudação, indicadores, acesso rápido, "Atenção necessária" e a agenda da semana.
// Ficha do aluno e nova avaliação abrem em modal (useModaisDoProfissional).
// Números vêm de obterResumoProfissional() (profissionalService.ts).
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, CalendarDays, ClipboardList, ClipboardPlus, Clock3, Users } from 'lucide-react'
import { AppLayout } from '../../components/layout'
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
import { DIAS_PARA_NOVA_AVALIACAO, diaSemanaDeHoje, obterResumoProfissional } from '../../data'
import { useAuthStore } from '../../store/authStore'
import { ESTILO_SITUACAO, NOME_DIA, descricaoSituacao } from './rotulos'
import { useModaisDoProfissional } from './useModaisDoProfissional'

type AbaAtencao = 'tudo' | 'semAvaliacao' | 'vencida'

const ABAS_ATENCAO: { id: AbaAtencao; label: string }[] = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'semAvaliacao', label: 'Sem avaliação' },
  { id: 'vencida', label: 'Mensal pendente' },
]

export function ProfessionalDashboardPage() {
  const usuarioAtual = useAuthStore((state) => state.usuarioAtual)
  const profissionalId = usuarioAtual?.refId ?? ''
  const navigate = useNavigate()

  const [resumo, setResumo] = useState(() => obterResumoProfissional(profissionalId))
  const [abaAtencao, setAbaAtencao] = useState<AbaAtencao>('tudo')
  const recarregar = useCallback(() => setResumo(obterResumoProfissional(profissionalId)), [profissionalId])
  const { abrirFicha, abrirNovaAvaliacao, modais } = useModaisDoProfissional(recarregar)

  const semAvaliacao = resumo.atencao.filter((item) => item.situacao === 'semAvaliacao').length
  const vencidas = resumo.atencao.length - semAvaliacao
  const itensAtencao = abaAtencao === 'tudo' ? resumo.atencao : resumo.atencao.filter((item) => item.situacao === abaAtencao)
  const hoje = diaSemanaDeHoje()

  return (
    <AppLayout>
      {/* A. Saudação e contexto */}
      <CabecalhoCentral
        nome={usuarioAtual?.nome ?? ''}
        subtitulo="Como estão seus alunos hoje?"
        contexto={`${resumo.alunos.length} ${resumo.alunos.length === 1 ? 'aluno personal' : 'alunos personal'}`}
      />

      {/* B. Indicadores */}
      <FaixaIndicadores>
        <Indicador
          icon={Users}
          iconClasses="bg-emerald-50 text-emerald-700"
          valor={resumo.alunos.length}
          titulo={resumo.alunos.length === 1 ? 'aluno' : 'alunos'}
          contexto="Com vínculo personal com você"
        />
        <Indicador
          icon={ClipboardList}
          iconClasses="bg-amber-50 text-amber-600"
          valor={resumo.avaliacoesNoMes}
          titulo={resumo.avaliacoesNoMes === 1 ? 'avaliação no mês' : 'avaliações no mês'}
          contexto={
            resumo.atencao.length === 0
              ? 'Todos os alunos estão com a avaliação em dia'
              : [semAvaliacao > 0 ? `${semAvaliacao} sem avaliação` : '', vencidas > 0 ? `${vencidas} com mensal pendente` : '']
                  .filter(Boolean)
                  .join(' · ')
          }
        />
        <Indicador
          icon={CalendarClock}
          iconClasses="bg-rose-50 text-rose-600"
          valor={resumo.horariosHoje.length}
          titulo={resumo.horariosHoje.length === 1 ? 'horário hoje' : 'horários hoje'}
          contexto={
            resumo.horariosHoje.length === 0
              ? 'Sem atendimento hoje'
              : resumo.horariosHoje.map((item) => `${item.horaInicio}–${item.horaFim}`).join(', ')
          }
        />
      </FaixaIndicadores>

      {/* C. Acesso rápido */}
      <AcessoRapido colunas={3}>
        <AcaoRapida
          destaque
          icon={ClipboardPlus}
          titulo="Nova avaliação"
          descricao="Principal ou mensal, com comparação automática"
          onClick={() => abrirNovaAvaliacao()}
        />
        <AcaoRapida
          icon={Users}
          titulo="Meus alunos"
          descricao="Fichas, metas, treinos e histórico de avaliações"
          onClick={() => navigate('/profissional/alunos')}
        />
        <AcaoRapida
          icon={CalendarDays}
          titulo="Minha agenda"
          descricao="Horários semanais que aparecem na vitrine"
          onClick={() => navigate('/profissional/agenda')}
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
            <EstadoVazio
              titulo="Tudo certo por aqui."
              descricao={`Todos têm avaliação principal e a última foi há menos de ${DIAS_PARA_NOVA_AVALIACAO} dias.`}
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {itensAtencao.map((item) => {
                const estilo = ESTILO_SITUACAO[item.situacao]
                return (
                  <ItemAluno
                    key={item.aluno.id}
                    aluno={item.aluno}
                    nome={item.aluno.fullName}
                    descricao={descricaoSituacao(item)}
                    selo={estilo}
                    barra={estilo.barra}
                    acao={{ label: 'Avaliar', onClick: () => abrirNovaAvaliacao(item.aluno.id) }}
                    onAbrir={() => abrirFicha(item.aluno.id)}
                  />
                )
              })}
            </ul>
          )}
        </section>

        {/* E. Agenda da semana, com hoje em destaque */}
        <section aria-label="Agenda da semana" className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Agenda da semana</h2>
            <button
              type="button"
              onClick={() => navigate('/profissional/agenda')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Editar
            </button>
          </div>
          {resumo.grade.length === 0 ? (
            <EstadoVazio titulo="Nenhum horário cadastrado." descricao="Cadastre seus horários em Minha agenda." />
          ) : (
            <ol className="relative mt-4">
              <span className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200" aria-hidden />
              {resumo.grade.map((item) => {
                const ehHoje = item.diaSemana === hoje
                return (
                  <li key={item.id} className="relative flex items-center gap-3 py-2.5 pr-2">
                    <span
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        ehHoje ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <Clock3 size={16} />
                    </span>
                    <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                      {NOME_DIA[item.diaSemana]}
                      {ehHoje ? (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Hoje
                        </span>
                      ) : null}
                    </p>
                    <span className="shrink-0 text-xs text-slate-500">
                      {item.horaInicio}–{item.horaFim}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      {modais}
    </AppLayout>
  )
}
