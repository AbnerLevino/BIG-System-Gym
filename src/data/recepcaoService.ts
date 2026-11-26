// Monta a "Central da Recepção" (tela inicial do atendente) a partir dos dados que
// já existem — nada é inventado aqui, só cruzado: Aluno, Pagamento, CheckIn e
// HistoricoPlano. A tela só desenha o que esta função devolve.
import type { Aluno, MetodoPagamento, Pagamento } from '../types'
import { obterAlunos } from './alunoRepository'
import { obterCheckins } from './checkinRepository'
import { obterHistoricoPlanos } from './historicoPlanoRepository'
import { obterPagamentos } from './pagamentoRepository'
import { obterPlanoPorId } from './planoRepository'

// Janela de "renovação": cobrança em aberto que vence de hoje até daqui a 7 dias.
const DIAS_JANELA_RENOVACAO = 7
const LIMITE_MOVIMENTACOES = 8

export type PrioridadePendencia = 'alta' | 'media' | 'baixa'
export type TipoPendencia = 'atrasado' | 'venceHoje' | 'venceEmBreve' | 'semFaceId'

export interface Pendencia {
  id: string
  alunoId: string
  nomeAluno: string
  tipo: TipoPendencia
  prioridade: PrioridadePendencia
  descricao: string
  // Presente quando a pendência é de cobrança (dá pra ir direto receber).
  pagamento?: Pagamento
}

export type TipoMovimentacao = 'checkin' | 'checkinBloqueado' | 'pagamento' | 'matricula' | 'trocaPlano' | 'cancelamento'

export interface Movimentacao {
  id: string
  alunoId: string
  nomeAluno: string
  tipo: TipoMovimentacao
  descricao: string
  // ISO. Quando o dado de origem só tem data (sem hora), temHorario = false.
  quando: string
  temHorario: boolean
}

export interface ResumoRecepcao {
  alunosAtivos: number
  visitasTeste: number
  checkinsHoje: number
  checkinsBloqueadosHoje: number
  renovacoes: Pendencia[]
  pendencias: Pendencia[]
  // Renovações + pendências, da mais urgente pra menos urgente.
  atencao: Pendencia[]
  movimentacoes: Movimentacao[]
}

const LABEL_METODO: Record<MetodoPagamento, string> = {
  pix: 'Pix',
  creditCard: 'cartão de crédito',
  debitCard: 'cartão de débito',
  cash: 'dinheiro',
  partner: 'parceiro',
}

const PESO_PRIORIDADE: Record<PrioridadePendencia, number> = { alta: 0, media: 1, baixa: 2 }

// Data local (não UTC) no formato AAAA-MM-DD — "hoje" é o dia da recepção.
export function dataLocalISO(data: Date = new Date()): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function diasAte(dataISO: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  return Math.round((new Date(ano, mes - 1, dia).getTime() - hoje.getTime()) / 86_400_000)
}

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

function pendenciaDeCobranca(aluno: Aluno, pagamento: Pagamento): Pendencia | null {
  const dias = diasAte(pagamento.dueDate)
  const valor = formatarMoeda(pagamento.originalValue)
  const base = { alunoId: aluno.id, nomeAluno: aluno.fullName, pagamento }

  if (pagamento.status === 'late') {
    const atraso = Math.max(0, -dias)
    return {
      ...base,
      id: `atrasado-${pagamento.id}`,
      tipo: 'atrasado',
      prioridade: 'alta',
      descricao: `Mensalidade de ${valor} atrasada${atraso > 0 ? ` há ${atraso} ${atraso === 1 ? 'dia' : 'dias'}` : ''} · check-in bloqueado`,
    }
  }
  if (pagamento.status !== 'pending' || dias < 0 || dias > DIAS_JANELA_RENOVACAO) return null
  if (dias === 0) {
    return { ...base, id: `vence-${pagamento.id}`, tipo: 'venceHoje', prioridade: 'media', descricao: `Plano vence hoje · ${valor}` }
  }
  return {
    ...base,
    id: `vence-${pagamento.id}`,
    tipo: 'venceEmBreve',
    prioridade: 'baixa',
    descricao: `Plano vence ${dias === 1 ? 'amanhã' : `em ${dias} dias`} · ${valor}`,
  }
}

function montarMovimentacoes(alunosPorId: Map<string, Aluno>): Movimentacao[] {
  const nome = (alunoId: string) => alunosPorId.get(alunoId)?.fullName ?? 'Aluno removido'
  // Dado só com data entra no meio do dia, pra ordenar junto dos que têm hora.
  const meioDoDia = (data: string) => `${data}T12:00:00`
  const lista: Movimentacao[] = []

  obterCheckins().forEach((checkin) => {
    lista.push({
      id: `checkin-${checkin.id}`,
      alunoId: checkin.alunoId,
      nomeAluno: nome(checkin.alunoId),
      tipo: checkin.accessGranted ? 'checkin' : 'checkinBloqueado',
      descricao: checkin.accessGranted
        ? `Entrada liberada${checkin.method === 'faceId' ? ' por Face ID' : ''}`
        : 'Entrada bloqueada na catraca',
      quando: checkin.timestamp,
      temHorario: true,
    })
  })

  obterPagamentos()
    .filter((pagamento) => pagamento.status === 'paid' && pagamento.paymentDate)
    .forEach((pagamento) => {
      const metodo = pagamento.paymentMethod ? ` via ${LABEL_METODO[pagamento.paymentMethod]}` : ''
      lista.push({
        id: `pagamento-${pagamento.id}`,
        alunoId: pagamento.alunoId,
        nomeAluno: nome(pagamento.alunoId),
        tipo: 'pagamento',
        descricao: `Pagamento de ${formatarMoeda(pagamento.paidValue ?? pagamento.originalValue)}${metodo}`,
        quando: meioDoDia(pagamento.paymentDate!),
        temHorario: false,
      })
    })

  alunosPorId.forEach((aluno) => {
    const plano = aluno.planoAtualId ? obterPlanoPorId(aluno.planoAtualId) : undefined
    lista.push({
      id: `matricula-${aluno.id}`,
      alunoId: aluno.id,
      nomeAluno: aluno.fullName,
      tipo: 'matricula',
      descricao: aluno.status === 'trial' ? 'Visita teste registrada' : `Novo aluno${plano ? ` · ${plano.name}` : ''}`,
      quando: meioDoDia(aluno.startDate),
      temHorario: false,
    })
  })

  // HistoricoPlano: um período que começa depois de outro do mesmo aluno é troca de
  // plano; período encerrado de aluno cancelado é o cancelamento.
  const historico = obterHistoricoPlanos().sort((a, b) => a.startDate.localeCompare(b.startDate))
  const jaTinhaPlano = new Set<string>()
  historico.forEach((item) => {
    if (jaTinhaPlano.has(item.alunoId)) {
      lista.push({
        id: `troca-${item.id}`,
        alunoId: item.alunoId,
        nomeAluno: nome(item.alunoId),
        tipo: 'trocaPlano',
        descricao: `Plano alterado para ${obterPlanoPorId(item.planoId)?.name ?? 'outro plano'}`,
        quando: meioDoDia(item.startDate),
        temHorario: false,
      })
    }
    jaTinhaPlano.add(item.alunoId)

    const aluno = alunosPorId.get(item.alunoId)
    if (item.endDate && aluno?.status === 'cancelled') {
      const aindaTemPlanoAberto = historico.some((outro) => outro.alunoId === item.alunoId && outro.endDate === null)
      if (!aindaTemPlanoAberto) {
        lista.push({
          id: `cancelamento-${item.id}`,
          alunoId: item.alunoId,
          nomeAluno: aluno.fullName,
          tipo: 'cancelamento',
          descricao: 'Matrícula cancelada',
          quando: meioDoDia(item.endDate),
          temHorario: false,
        })
      }
    }
  })

  return lista.sort((a, b) => b.quando.localeCompare(a.quando)).slice(0, LIMITE_MOVIMENTACOES)
}

export function obterResumoRecepcao(): ResumoRecepcao {
  const alunos = obterAlunos()
  const alunosPorId = new Map(alunos.map((aluno) => [aluno.id, aluno]))
  const naoCancelados = alunos.filter((aluno) => aluno.status !== 'cancelled')

  const hoje = dataLocalISO()
  const checkinsDeHoje = obterCheckins().filter((checkin) => dataLocalISO(new Date(checkin.timestamp)) === hoje)

  const cobrancas: Pendencia[] = []
  const pagamentosEmAberto = obterPagamentos().filter((pagamento) => pagamento.status !== 'paid')
  naoCancelados.forEach((aluno) => {
    pagamentosEmAberto
      .filter((pagamento) => pagamento.alunoId === aluno.id)
      .forEach((pagamento) => {
        const pendencia = pendenciaDeCobranca(aluno, pagamento)
        if (pendencia) cobrancas.push(pendencia)
      })
  })

  const semFaceId: Pendencia[] = naoCancelados
    .filter((aluno) => aluno.status === 'active' && !aluno.faceDescriptor)
    .map((aluno) => ({
      id: `face-${aluno.id}`,
      alunoId: aluno.id,
      nomeAluno: aluno.fullName,
      tipo: 'semFaceId',
      prioridade: 'baixa',
      descricao: 'Face ID não cadastrado · não consegue entrar pela catraca',
    }))

  const renovacoes = cobrancas.filter((item) => item.tipo === 'venceHoje' || item.tipo === 'venceEmBreve')
  const pendencias = [...cobrancas.filter((item) => item.tipo === 'atrasado'), ...semFaceId]

  const atencao = [...pendencias, ...renovacoes].sort((a, b) => {
    const porPrioridade = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade]
    if (porPrioridade !== 0) return porPrioridade
    return (a.pagamento?.dueDate ?? '9999').localeCompare(b.pagamento?.dueDate ?? '9999')
  })

  return {
    alunosAtivos: alunos.filter((aluno) => aluno.status === 'active').length,
    visitasTeste: alunos.filter((aluno) => aluno.status === 'trial').length,
    checkinsHoje: checkinsDeHoje.filter((checkin) => checkin.accessGranted).length,
    checkinsBloqueadosHoje: checkinsDeHoje.filter((checkin) => !checkin.accessGranted).length,
    renovacoes,
    pendencias,
    atencao,
    movimentacoes: montarMovimentacoes(alunosPorId),
  }
}
