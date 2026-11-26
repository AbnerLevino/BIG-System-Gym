// Agenda semanal RECORRENTE do profissional (RF-FUND-03, D13): dia da semana +
// horário de início/fim, repete toda semana. Sem bloqueio de data pontual.
// Quem edita é o próprio profissional (D14) — tela do módulo Profissional/Fundação.
import type { DiaSemana } from './treino'

export interface AgendaProfissional {
  id: string
  profissionalId: string
  diaSemana: DiaSemana
  // "HH:MM", 24h.
  horaInicio: string
  horaFim: string
}
