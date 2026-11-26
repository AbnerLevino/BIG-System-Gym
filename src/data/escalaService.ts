import type { TurnoTrabalho } from '../types/horarioTrabalho';
import type { RegistroPonto } from '../types/registroPonto';

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Data no fuso local (AAAA-MM-DD). Não usar toISOString, que é UTC.
export function dataLocal(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function turnoDoDia(turnos: TurnoTrabalho[], diaSemana: number): TurnoTrabalho | undefined {
  return turnos.find((t) => t.diaSemana === diaSemana);
}

// O funcionário deveria estar trabalhando neste instante, segundo a grade?
export function estaNoTurnoAgora(turnos: TurnoTrabalho[], agora: Date = new Date()): boolean {
  const t = turnoDoDia(turnos, agora.getDay());
  if (!t) return false;
  const atual = agora.getHours() * 60 + agora.getMinutes();
  return atual >= minutos(t.inicio) && atual < minutos(t.fim);
}

// Ex: "Seg–Sex 08:00–12:00 · Sáb 09:00–13:00"
export function resumoGrade(turnos: TurnoTrabalho[]): string {
  if (turnos.length === 0) return 'Sem horário definido';
  const ordenados = [...turnos].sort((a, b) => a.diaSemana - b.diaSemana);
  const grupos: { ini: number; fim: number; inicio: string; horaFim: string }[] = [];
  for (const t of ordenados) {
    const ult = grupos[grupos.length - 1];
    if (ult && ult.inicio === t.inicio && ult.horaFim === t.fim && ult.fim === t.diaSemana - 1) {
      ult.fim = t.diaSemana;
    } else {
      grupos.push({ ini: t.diaSemana, fim: t.diaSemana, inicio: t.inicio, horaFim: t.fim });
    }
  }
  return grupos
    .map((g) => {
      const dias = g.ini === g.fim ? DIAS_CURTOS[g.ini] : `${DIAS_CURTOS[g.ini]}–${DIAS_CURTOS[g.fim]}`;
      return `${dias} ${g.inicio}–${g.horaFim}`;
    })
    .join(' · ');
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarData(aaaaMmDd: string): string {
  const [a, m, d] = aaaaMmDd.split('-');
  return `${d}/${m}/${a}`;
}

export function minutosTrabalhados(r: RegistroPonto): number {
  if (!r.saida) return 0;
  return Math.max(0, Math.round((new Date(r.saida).getTime() - new Date(r.entrada).getTime()) / 60000));
}

export function formatarDuracao(totalMin: number): string {
  return `${Math.floor(totalMin / 60)}h ${String(totalMin % 60).padStart(2, '0')}min`;
}

// Nome de exibição de Atendente/Profissional (aceita nomeCompleto ou name).
export function nomeFuncionario(f: unknown): string {
  const x = f as { nomeCompleto?: string; name?: string };
  return x.nomeCompleto ?? x.name ?? 'Funcionário';
}
