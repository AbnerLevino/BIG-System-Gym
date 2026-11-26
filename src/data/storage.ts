// Camada genérica que esconde o localStorage (ele só guarda texto, por isso o
// JSON.stringify/parse). Os *Repository.ts chamam essas 3 funções em vez de tocar
// no localStorage direto — se um dia trocar pra um banco real, só este arquivo muda.
const PREFIX = 'biggym:'

export function readCollection<T>(key: string, fallback: T[]): T[] {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return fallback
  return JSON.parse(raw) as T[]
}

export function writeCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items))
}

export function ensureSeeded<T>(key: string, seedData: T[]): void {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) {
    writeCollection(key, seedData)
  }
}
// Sobe esse número sempre que o formato de alguma entidade ou o seed mudar de um
// jeito incompatível com o que já está salvo no navegador (ex: Treino trocou
// `name` por `exercicioId`/`diaSemana`). Na próxima abertura, os dados antigos
// são descartados e o seed novo é carregado — a sessão de login é preservada.
const VERSAO_DOS_DADOS = '4'
const CHAVE_VERSAO = PREFIX + 'versao-dados'
const CHAVE_SESSAO = PREFIX + 'session'

export function garantirVersaoDosDados(): void {
  if (localStorage.getItem(CHAVE_VERSAO) === VERSAO_DOS_DADOS) return
  Object.keys(localStorage)
    .filter((chave) => chave.startsWith(PREFIX) && chave !== CHAVE_SESSAO)
    .forEach((chave) => localStorage.removeItem(chave))
  localStorage.setItem(CHAVE_VERSAO, VERSAO_DOS_DADOS)
}
