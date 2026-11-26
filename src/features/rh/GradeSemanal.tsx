import { Table } from '../../components/common';
import { DIAS_SEMANA, turnoDoDia } from '../../data/escalaService';
import type { TurnoTrabalho } from '../../types/horarioTrabalho';

// Tabela só de leitura com os 7 dias da semana.
export default function GradeSemanal({ turnos }: { turnos: TurnoTrabalho[] }) {
  const hoje = new Date().getDay();
  const linhas = DIAS_SEMANA.map((nome, dia) => ({ dia, nome, turno: turnoDoDia(turnos, dia) }));
  return (
    <Table
      columns={[
        {
          header: 'Dia',
          render: (l: (typeof linhas)[number]) => (
            <span className={l.dia === hoje ? 'font-semibold text-emerald-700' : ''}>
              {l.nome}
              {l.dia === hoje ? ' (hoje)' : ''}
            </span>
          ),
        },
        {
          header: 'Horário',
          render: (l: (typeof linhas)[number]) => (l.turno ? `${l.turno.inicio} às ${l.turno.fim}` : 'Folga'),
        },
      ]}
      rows={linhas}
      rowKey={(l: (typeof linhas)[number]) => String(l.dia)}
    />
  );
}
