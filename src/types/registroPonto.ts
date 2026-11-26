import type { TipoFuncionario } from './horarioTrabalho';

// Marcação simulada de entrada/saída (sem catraca nem biometria).
export interface RegistroPonto {
  id: string;
  funcionarioId: string;
  funcionarioTipo: TipoFuncionario;
  data: string; // AAAA-MM-DD (data local da entrada)
  entrada: string; // ISO
  saida?: string; // ISO; ausente = ponto em aberto
}
