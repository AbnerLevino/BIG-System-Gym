// Textos e cores repetidos nas telas do profissional.
import type { DiaSemana, StatusMeta } from '../../types'
import type { AlunoDoProfissional, SituacaoAvaliacao } from '../../data'
import type { SeloItem } from '../../components/painel'
import { formatarDataBr, formatarNumero } from '../../utils/formatacao'

export { formatarNumero }

export const NOME_DIA: Record<DiaSemana, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

export const ESTILO_SITUACAO: Record<SituacaoAvaliacao, SeloItem & { barra: string }> = {
  semAvaliacao: { label: 'Sem avaliação', classes: 'bg-rose-50 text-rose-700', barra: 'bg-rose-500' },
  vencida: { label: 'Mensal pendente', classes: 'bg-amber-50 text-amber-700', barra: 'bg-amber-500' },
  emDia: { label: 'Em dia', classes: 'bg-emerald-50 text-emerald-700', barra: 'bg-emerald-500' },
}


const ROTULO_MEDIDA: Record<string, string> = {
  peito: 'Peito',
  braco: 'Braço',
  cintura: 'Cintura',
  quadril: 'Quadril',
  coxa: 'Coxa',
}

// As chaves de AvaliacaoFisica.measurements são livres; as conhecidas ganham acento.
export function rotuloMedida(nome: string): string {
  return ROTULO_MEDIDA[nome] ?? nome.charAt(0).toUpperCase() + nome.slice(1)
}

export const LABEL_STATUS_META: Record<StatusMeta, string> = {
  inProgress: 'Em andamento',
  completed: 'Concluída',
  late: 'Atrasada',
}

export function descricaoSituacao(item: AlunoDoProfissional): string {
  if (!item.ultima) return 'Ainda não tem a avaliação principal (referência)'
  const quando =
    item.diasDesdeUltima === 0 ? 'hoje' : item.diasDesdeUltima === 1 ? 'há 1 dia' : `há ${item.diasDesdeUltima} dias`
  return `Última avaliação (${item.ultima.tipo}) em ${formatarDataBr(item.ultima.assessmentDate)}, ${quando} · ${formatarNumero(item.ultima.weight)} kg`
}
