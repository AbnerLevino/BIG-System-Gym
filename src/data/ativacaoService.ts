// Fluxo de ativação de conta em dois lados (RF-ATD-04/05/06/07 + RF-ALU-01):
// o atendente fecha matrícula e pagamento e o sistema gera um convite; o aluno,
// sozinho, usa o link pra criar a própria senha. Nenhum atendente vê a senha.
//
// SIMULADO: sem backend, não há envio real de e-mail — o link aparece na tela do
// atendente. O token é aleatório (crypto.getRandomValues), nunca o e-mail na URL;
// num backend real a validação aconteceria no servidor.
import type { ConviteAtivacao, Usuario } from '../types'
import {
  obterConvitePorToken,
  obterConvitesPorUsuario,
  salvarConviteAtivacao,
} from './conviteAtivacaoRepository'
import { buscarUsuarioPorEmail, obterUsuarioPorId, salvarUsuario, usuarioPendenteDeSenha } from './usuarioRepository'

const VALIDADE_HORAS = 48
export const TAMANHO_MINIMO_SENHA = 6

function gerarToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function agora(): string {
  return new Date().toISOString()
}

// Cria um convite novo pro usuário e invalida qualquer convite anterior ainda aberto.
export function gerarConviteAtivacao(usuarioId: string): ConviteAtivacao {
  const momento = agora()
  obterConvitesPorUsuario(usuarioId)
    .filter((convite) => convite.usadoEm === null && convite.invalidadoEm === null)
    .forEach((convite) => salvarConviteAtivacao({ ...convite, invalidadoEm: momento }))

  const expira = new Date()
  expira.setHours(expira.getHours() + VALIDADE_HORAS)
  const convite: ConviteAtivacao = {
    id: crypto.randomUUID(),
    usuarioId,
    token: gerarToken(),
    criadoEm: momento,
    expiraEm: expira.toISOString(),
    usadoEm: null,
    invalidadoEm: null,
  }
  salvarConviteAtivacao(convite)
  return convite
}

// Convite mais recente que ainda pode ser usado (não usado, não invalidado, não expirado).
export function obterConviteVigente(usuarioId: string): ConviteAtivacao | undefined {
  const momento = agora()
  return obterConvitesPorUsuario(usuarioId)
    .filter((convite) => convite.usadoEm === null && convite.invalidadoEm === null && convite.expiraEm > momento)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))[0]
}

export type SituacaoConvite = 'valido' | 'expirado' | 'usado' | 'invalido'

export interface ValidacaoConvite {
  situacao: SituacaoConvite
  convite?: ConviteAtivacao
  usuario?: Usuario
}

export function validarConvite(token: string): ValidacaoConvite {
  const convite = obterConvitePorToken(token)
  if (!convite) return { situacao: 'invalido' }
  const usuario = obterUsuarioPorId(convite.usuarioId)
  if (!usuario) return { situacao: 'invalido' }
  if (convite.usadoEm !== null || !usuarioPendenteDeSenha(usuario)) return { situacao: 'usado', convite, usuario }
  // Substituído por um convite mais novo (ex: e-mail corrigido) conta como inválido.
  if (convite.invalidadoEm !== null) return { situacao: 'invalido', convite, usuario }
  if (convite.expiraEm <= agora()) return { situacao: 'expirado', convite, usuario }
  return { situacao: 'valido', convite, usuario }
}

// RF-ALU-01: define a senha, libera o login e queima o token (uso único).
export function ativarConta(token: string, senha: string): { ok: true; usuario: Usuario } | { ok: false; erro: string } {
  const { situacao, convite, usuario } = validarConvite(token)
  if (situacao !== 'valido' || !convite || !usuario) {
    return { ok: false, erro: 'Este link de ativação não é mais válido. Peça um novo convite na recepção.' }
  }
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return { ok: false, erro: `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.` }
  }
  const ativado: Usuario = { ...usuario, password: senha }
  salvarUsuario(ativado)
  salvarConviteAtivacao({ ...convite, usadoEm: agora() })
  return { ok: true, usuario: ativado }
}

// RF-ATD-07: e-mail errado → corrige no MESMO Usuario (não duplica cadastro) e gera
// um convite novo, invalidando o anterior.
export function corrigirEmailEReenviarConvite(
  usuarioId: string,
  novoEmail: string,
): { ok: true; convite: ConviteAtivacao } | { ok: false; erro: string } {
  const usuario = obterUsuarioPorId(usuarioId)
  if (!usuario) return { ok: false, erro: 'Usuário não encontrado.' }
  if (!usuarioPendenteDeSenha(usuario)) return { ok: false, erro: 'Esta conta já foi ativada pelo aluno.' }

  const email = novoEmail.trim()
  const existente = buscarUsuarioPorEmail(email)
  if (existente && existente.id !== usuario.id) return { ok: false, erro: 'Este e-mail já está cadastrado no sistema.' }

  salvarUsuario({ ...usuario, email })
  return { ok: true, convite: gerarConviteAtivacao(usuario.id) }
}

// Link que vai no convite. Usa o endereço atual do app (em demo, abrir pelo IP
// da rede faz o QR code funcionar no celular).
export function montarLinkAtivacao(token: string): string {
  return `${window.location.origin}/ativar/${token}`
}

// Troca de senha pelo próprio usuário logado (tela Perfil do aluno).
export function alterarSenha(
  usuarioId: string,
  senhaAtual: string,
  novaSenha: string,
): { ok: true; usuario: Usuario } | { ok: false; erro: string } {
  const usuario = obterUsuarioPorId(usuarioId)
  if (!usuario) return { ok: false, erro: 'Usuário não encontrado.' }
  if (usuario.password !== senhaAtual) return { ok: false, erro: 'A senha atual não confere.' }
  if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
    return { ok: false, erro: `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.` }
  }
  if (novaSenha === senhaAtual) return { ok: false, erro: 'A nova senha precisa ser diferente da atual.' }
  const atualizado: Usuario = { ...usuario, password: novaSenha }
  salvarUsuario(atualizado)
  return { ok: true, usuario: atualizado }
}
