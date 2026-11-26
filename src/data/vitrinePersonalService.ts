// Vitrine de personal trainers (RF-ALU-09, D11/D12).
//
// PONTOS DE ACOPLAMENTO com o módulo Profissional/Fundação:
//   - agenda: lida de agendaProfissionalRepository (contrato do RF-FUND-03) — hoje
//     só seed de exemplo; a tela de edição do profissional grava no mesmo lugar.
//   - valor do personal: Profissional não tem campo de preço ainda, então o valor
//     mensal vem da tabela MOCK abaixo. Quando o grupo definir onde mora o preço,
//     só `valorMensalDoPersonal` muda.
import type { AgendaProfissional, Atendimento, Profissional } from '../types'
import { obterAgendaPorProfissional } from './agendaProfissionalRepository'
import {
  obterAtendimentoPersonalPorAluno,
  obterAtendimentosPorAluno,
  salvarAtendimento,
} from './atendimentoRepository'
import { obterProfissionais, obterProfissionalPorId } from './profissionalRepository'
import { obterTreinosPorAluno, salvarTreino } from './treinoRepository'

// MOCK: valor mensal cobrado pelo personal (somado na mensalidade, D7).
const VALOR_MENSAL_PERSONAL_MOCK: Record<string, number> = {
  'prof-2': 150,
  'prof-3': 180,
  'prof-4': 160,
}
const VALOR_MENSAL_PERSONAL_PADRAO = 150

export function valorMensalDoPersonal(profissionalId: string): number {
  return VALOR_MENSAL_PERSONAL_MOCK[profissionalId] ?? VALOR_MENSAL_PERSONAL_PADRAO
}

export interface PersonalNaVitrine {
  profissional: Profissional
  agenda: AgendaProfissional[]
  valorMensal: number
}

function montar(profissional: Profissional): PersonalNaVitrine {
  return {
    profissional,
    agenda: obterAgendaPorProfissional(profissional.id),
    valorMensal: valorMensalDoPersonal(profissional.id),
  }
}

// Personal trainers da academia (classificação padrão 'personalTrainer').
export function obterPersonaisDisponiveis(): PersonalNaVitrine[] {
  return obterProfissionais()
    .filter((profissional) => profissional.baseType === 'personalTrainer')
    .map(montar)
    .sort((a, b) => a.profissional.name.localeCompare(b.profissional.name))
}

// D11: aluno com Atendimento 'personal' vê só esse profissional.
export function obterPersonalDoAluno(alunoId: string): (PersonalNaVitrine & { atendimento: Atendimento }) | undefined {
  const atendimento = obterAtendimentoPersonalPorAluno(alunoId)
  if (!atendimento) return undefined
  const profissional = obterProfissionalPorId(atendimento.profissionalId)
  if (!profissional) return undefined
  return { ...montar(profissional), valorMensal: atendimento.value ?? valorMensalDoPersonal(profissional.id), atendimento }
}

// D12: contratar ATUALIZA o Atendimento do aluno (type 'personal', profissionalId,
// value) — nenhum Pagamento é criado aqui; o valor entra no próximo pagamento
// gerado automaticamente pelo motor de cobrança (RF-FUND-02).
export function contratarPersonal(alunoId: string, profissionalId: string): Atendimento | undefined {
  if (obterAtendimentoPersonalPorAluno(alunoId)) return undefined

  const value = valorMensalDoPersonal(profissionalId)
  const standard = obterAtendimentosPorAluno(alunoId).find((item) => item.type === 'standard')
  const atendimento: Atendimento = standard
    ? { ...standard, type: 'personal', profissionalId, value }
    : { id: crypto.randomUUID(), alunoId, profissionalId, type: 'personal', value }
  salvarAtendimento(atendimento)

  // Aluno sem vínculo nenhum tinha a grade "solta" (atendimentoId vazio): ela passa
  // a pertencer ao novo vínculo, pra não perder o treino que ele já montou.
  obterTreinosPorAluno(alunoId)
    .filter((treino) => treino.active && treino.atendimentoId === '')
    .forEach((treino) => salvarTreino({ ...treino, atendimentoId: atendimento.id }))

  return atendimento
}
