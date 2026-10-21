import jsPDF from 'jspdf'
import type { MetodoPagamento, Pagamento } from '../types'
import { obterPagamentos, salvarPagamento } from './pagamentoRepository'

const DELAY_SIMULADO_MS = 1200
const CHANCE_DE_RECUSA = 0.1

function proximoNumeroComprovante(): string {
  const pagamentos = obterPagamentos()
  const quantidadeComComprovante = pagamentos.filter((pagamento) => pagamento.receiptNumber).length
  return `CMP-${String(quantidadeComComprovante + 1).padStart(4, '0')}`
}

export interface ResultadoProcessamento {
  aprovado: boolean
  pagamentoAtualizado: Pagamento
}

// Simulação: sempre tem um delay (parece processamento real) e recusa ~10% das vezes
// pra existir caminho de erro pra tratar na tela. Nenhuma integração real de pagamento
// — é aqui, e só aqui, que entraria uma chamada a um gateway real no futuro.
export async function processarPagamento(
  pagamento: Pagamento,
  paymentMethod: MetodoPagamento,
): Promise<ResultadoProcessamento> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_SIMULADO_MS))

  const aprovado = Math.random() > CHANCE_DE_RECUSA

  if (!aprovado) {
    return { aprovado: false, pagamentoAtualizado: pagamento }
  }

  const pagamentoAtualizado: Pagamento = {
    ...pagamento,
    paidValue: pagamento.originalValue,
    paymentMethod,
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    receiptNumber: proximoNumeroComprovante(),
  }

  salvarPagamento(pagamentoAtualizado)

  return { aprovado: true, pagamentoAtualizado }
}

export function gerarComprovantePDF(pagamento: Pagamento, nomeAluno: string): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('BigGym - Comprovante de Pagamento', 20, 20)
  doc.setFontSize(12)
  doc.text(`Comprovante: ${pagamento.receiptNumber ?? ''}`, 20, 40)
  doc.text(`Aluno: ${nomeAluno}`, 20, 50)
  doc.text(`Valor pago: R$ ${(pagamento.paidValue ?? 0).toFixed(2)}`, 20, 60)
  doc.text(`Data do pagamento: ${pagamento.paymentDate ?? ''}`, 20, 70)
  doc.text(`Metodo: ${pagamento.paymentMethod ?? ''}`, 20, 80)
  doc.save(`${pagamento.receiptNumber ?? 'comprovante'}.pdf`)
}
