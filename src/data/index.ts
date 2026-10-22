import { inicializarUsuarios } from './usuarioRepository'
import { inicializarAlunos } from './alunoRepository'
import { inicializarProfissionais } from './profissionalRepository'
import { inicializarAtendentes } from './atendenteRepository'
import { inicializarPlanos } from './planoRepository'
import { inicializarPagamentos } from './pagamentoRepository'
import { inicializarAtendimentos } from './atendimentoRepository'
import { inicializarTreinos } from './treinoRepository'
import { inicializarMetas } from './metaRepository'
import { inicializarAvaliacoesFisicas } from './avaliacaoFisicaRepository'
import { inicializarCheckins } from './checkinRepository'

export * from './usuarioRepository'
export * from './alunoRepository'
export * from './profissionalRepository'
export * from './atendenteRepository'
export * from './planoRepository'
export * from './pagamentoRepository'
export * from './atendimentoRepository'
export * from './treinoRepository'
export * from './metaRepository'
export * from './avaliacaoFisicaRepository'
export * from './checkinRepository'

export function inicializarTodosOsDados(): void {
  inicializarUsuarios()
  inicializarAlunos()
  inicializarProfissionais()
  inicializarAtendentes()
  inicializarPlanos()
  inicializarPagamentos()
  inicializarAtendimentos()
  inicializarTreinos()
  inicializarMetas()
  inicializarAvaliacoesFisicas()
  inicializarCheckins()
}
