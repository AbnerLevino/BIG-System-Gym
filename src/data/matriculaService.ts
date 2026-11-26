// Regras de matrícula que mexem em mais de uma entidade ao mesmo tempo (Aluno +
// HistoricoPlano), pra tela não precisar saber dessa coordenação.
import type { Aluno, ConviteAtivacao, Usuario } from '../types'
import { obterAlunoPorId, salvarAluno } from './alunoRepository'
import { gerarConviteAtivacao } from './ativacaoService'
import { encerrarPlanoAtualNoHistorico, registrarTrocaDePlano } from './historicoPlanoRepository'
import { salvarUsuario } from './usuarioRepository'

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

// RF-ATD-02 + RF-ATD-04/05: chamado quando o pagamento da primeira mensalidade é
// confirmado — só então a conta existe. Grava o Aluno, abre o período no
// HistoricoPlano e cria o Usuario "pendente de senha" (password vazio) com um
// convite de ativação. A senha quem cria é o próprio aluno, pelo convite.
export function matricularAluno(aluno: Aluno, email: string): { usuario: Usuario; convite: ConviteAtivacao } {
  salvarAluno({ ...aluno, status: 'active' })
  if (aluno.planoAtualId) registrarTrocaDePlano(aluno.id, aluno.planoAtualId, aluno.startDate)

  const usuario: Usuario = {
    id: crypto.randomUUID(),
    nome: aluno.fullName,
    email: email.trim(),
    password: '',
    role: 'subscriber',
    refId: aluno.id,
  }
  salvarUsuario(usuario)
  return { usuario, convite: gerarConviteAtivacao(usuario.id) }
}

// RF-ATD-10: salva a edição feita pelo atendente. O CPF é imutável — mesmo que a
// tela mande outro valor, prevalece o CPF já gravado. Se o plano mudou, a troca
// fica registrada no HistoricoPlano (o histórico financeiro não é reescrito).
export function salvarEdicaoDoAluno(alunoEditado: Aluno): void {
  const atual = obterAlunoPorId(alunoEditado.id)
  if (!atual) return

  const trocouDePlano = alunoEditado.planoAtualId !== atual.planoAtualId
  const aluno: Aluno = { ...alunoEditado, cpf: atual.cpf }

  if (trocouDePlano && aluno.planoAtualId) {
    registrarTrocaDePlano(aluno.id, aluno.planoAtualId, hoje())
    // Visita teste que ganhou plano vira assinante (mesma regra do cadastro).
    if (aluno.status === 'trial') aluno.status = 'active'
  }

  salvarAluno(aluno)
}

// RF-ATD-11: cancela a matrícula a partir de hoje. O bloqueio de acesso não é
// salvo à parte — check-in (avaliarAcesso) e login (alunoPodeAcessarSistema)
// olham o status a cada tentativa.
export function cancelarMatricula(alunoId: string): void {
  const aluno = obterAlunoPorId(alunoId)
  if (!aluno || aluno.status === 'cancelled') return
  encerrarPlanoAtualNoHistorico(alunoId, hoje())
  salvarAluno({ ...aluno, status: 'cancelled' })
}

// Aluno com matrícula cancelada não entra mais no sistema.
export function alunoPodeAcessarSistema(alunoId: string): boolean {
  return obterAlunoPorId(alunoId)?.status !== 'cancelled'
}
