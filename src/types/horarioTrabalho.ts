// Grade de horário semanal de um funcionário (definida pelo admin).
export type TipoFuncionario = 'atendente' | 'professional';

export interface TurnoTrabalho {
  diaSemana: number; // 0 = domingo ... 6 = sábado (igual a Date.getDay())
  inicio: string; // 'HH:MM'
  fim: string; // 'HH:MM'
}

export interface HorarioTrabalho {
  id: string;
  funcionarioId: string;
  funcionarioTipo: TipoFuncionario;
  turnos: TurnoTrabalho[]; // no máximo 1 turno por dia da semana
}
