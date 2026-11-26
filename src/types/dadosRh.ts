// Campos de RH compartilhados por Atendente e Profissional (Task 8 / D9).
// Atendente e Profissional devem estender esta interface:
//   export interface Atendente extends DadosRh { ... }
// E-mail de login NÃO entra aqui: já existe em Usuario.email.
export type TipoContratacao = 'clt' | 'pj' | 'estagio' | 'autonomo';

export interface DadosRh {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  endereco: string;
  telefone: string;
  contatoEmergencia: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoContratacao: TipoContratacao;
  cargo: string;
  dataAdmissao: string; // AAAA-MM-DD
  salario: number;
}
