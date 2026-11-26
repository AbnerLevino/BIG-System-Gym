import type { Mensagem } from '../types/mensagem';

const CHAVE = 'biggym:mensagens';

function ler(): Mensagem[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Mensagem[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: Mensagem[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

// Chamar dentro de inicializarTodosOsDados() em src/data/index.ts
export function inicializarMensagens(): void {
  if (localStorage.getItem(CHAVE) === null) gravar([]);
}

export function obterMensagens(): Mensagem[] {
  return ler().sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio));
}

export function obterMensagemPorId(id: string): Mensagem | undefined {
  return ler().find((m) => m.id === id);
}

export function obterMensagensPorRemetente(remetenteId: string): Mensagem[] {
  return obterMensagens().filter((m) => m.remetenteId === remetenteId);
}

export function salvarMensagem(mensagem: Mensagem): void {
  const lista = ler();
  const i = lista.findIndex((m) => m.id === mensagem.id);
  if (i >= 0) lista[i] = mensagem;
  else lista.push(mensagem);
  gravar(lista);
}
