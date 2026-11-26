import type { HorarioTrabalho } from '../types/horarioTrabalho';

const CHAVE = 'biggym:horarios-trabalho';

function ler(): HorarioTrabalho[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as HorarioTrabalho[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: HorarioTrabalho[]): void {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

// Chamar dentro de inicializarTodosOsDados() em src/data/index.ts
export function inicializarHorariosTrabalho(): void {
  if (localStorage.getItem(CHAVE) === null) gravar([]);
}

export function obterHorariosTrabalho(): HorarioTrabalho[] {
  return ler();
}

export function obterHorarioTrabalhoPorFuncionario(funcionarioId: string): HorarioTrabalho | undefined {
  return ler().find((h) => h.funcionarioId === funcionarioId);
}

export function salvarHorarioTrabalho(horario: HorarioTrabalho): void {
  const lista = ler();
  const i = lista.findIndex((h) => h.id === horario.id);
  if (i >= 0) lista[i] = horario;
  else lista.push(horario);
  gravar(lista);
}
