import type { RegistroPonto } from '../types/registroPonto';
import type { TipoFuncionario } from '../types/horarioTrabalho';
import { dataLocal } from './escalaService';

const CHAVE = 'biggym:registros-ponto';

function ler(): RegistroPonto[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as RegistroPonto[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: RegistroPonto[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

// Chamar dentro de inicializarTodosOsDados() em src/data/index.ts
export function inicializarRegistrosPonto(): void {
  if (localStorage.getItem(CHAVE) === null) gravar([]);
}

export function obterRegistrosPonto(): RegistroPonto[] {
  return ler().sort((a, b) => b.entrada.localeCompare(a.entrada));
}

export function obterRegistrosPontoPorFuncionario(funcionarioId: string): RegistroPonto[] {
  return obterRegistrosPonto().filter((r) => r.funcionarioId === funcionarioId);
}

export function obterRegistroPontoAberto(funcionarioId: string): RegistroPonto | undefined {
  return ler().find((r) => r.funcionarioId === funcionarioId && !r.saida);
}

export function salvarRegistroPonto(registro: RegistroPonto): void {
  const lista = ler();
  const i = lista.findIndex((r) => r.id === registro.id);
  if (i >= 0) lista[i] = registro;
  else lista.push(registro);
  gravar(lista);
}

// Se já existe ponto em aberto, devolve o existente (não duplica entrada).
export function registrarEntrada(funcionarioId: string, tipo: TipoFuncionario): RegistroPonto {
  const aberto = obterRegistroPontoAberto(funcionarioId);
  if (aberto) return aberto;
  const agora = new Date();
  const novo: RegistroPonto = {
    id: crypto.randomUUID(),
    funcionarioId,
    funcionarioTipo: tipo,
    data: dataLocal(agora),
    entrada: agora.toISOString(),
  };
  salvarRegistroPonto(novo);
  return novo;
}

// Só fecha se houver ponto em aberto.
export function registrarSaida(funcionarioId: string): RegistroPonto | undefined {
  const aberto = obterRegistroPontoAberto(funcionarioId);
  if (!aberto) return undefined;
  const fechado = { ...aberto, saida: new Date().toISOString() };
  salvarRegistroPonto(fechado);
  return fechado;
}
