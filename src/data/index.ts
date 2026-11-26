import { inicializarUsuarios } from './usuarioRepository'
import { inicializarAlunos } from './alunoRepository'
import { inicializarProfissionais } from './profissionalRepository'
import { inicializarAtendentes } from './atendenteRepository'
import { inicializarPlanos } from './planoRepository'
import { inicializarPagamentos } from './pagamentoRepository'
import { inicializarAtendimentos } from './atendimentoRepository'
import { inicializarTreinos } from './treinoRepository'
import { inicializarExercicios } from './exercicioRepository'
import { inicializarMetas } from './metaRepository'
import { inicializarAvaliacoesFisicas } from './avaliacaoFisicaRepository'
import { inicializarCheckins } from './checkinRepository'
import { inicializarHistoricoPlanos } from './historicoPlanoRepository'
import { inicializarConvitesAtivacao } from './conviteAtivacaoRepository'
import { inicializarObjetivosAlunos } from './objetivoAlunoRepository'
import { inicializarAgendasProfissionais } from './agendaProfissionalRepository'
import { garantirVersaoDosDados } from './storage'

export * from './usuarioRepository'
export * from './alunoRepository'
export * from './profissionalRepository'
export * from './atendenteRepository'
export * from './planoRepository'
export * from './pagamentoRepository'
export * from './atendimentoRepository'
export * from './treinoRepository'
export * from './exercicioRepository'
export * from './metaRepository'
export * from './avaliacaoFisicaRepository'
export * from './checkinRepository'
export * from './historicoPlanoRepository'
export * from './matriculaService'
export * from './recepcaoService'
export * from './conviteAtivacaoRepository'
export * from './ativacaoService'
export * from './objetivoAlunoRepository'
export * from './recomendacaoService'
export * from './metaService'
export * from './profissionalService'
export * from './agendaProfissionalRepository'
export * from './vitrinePersonalService'

export function inicializarTodosOsDados(): void {
  garantirVersaoDosDados()
  inicializarUsuarios()
  inicializarAlunos()
  inicializarProfissionais()
  inicializarAtendentes()
  inicializarPlanos()
  inicializarPagamentos()
  inicializarAtendimentos()
  inicializarTreinos()
  inicializarExercicios()
  inicializarMetas()
  inicializarAvaliacoesFisicas()
  inicializarCheckins()
  inicializarHistoricoPlanos()
  inicializarConvitesAtivacao()
  inicializarObjetivosAlunos()
  inicializarAgendasProfissionais()
}
