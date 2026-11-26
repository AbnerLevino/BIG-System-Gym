// Mensagem de mão única: aluno -> atendimento (Task 15).
// Vai para uma caixa de entrada compartilhada: qualquer atendente vê e pode marcar como lida.
export interface Mensagem {
  id: string;
  remetenteId: string; // id do aluno
  assunto: string;
  texto: string;
  dataEnvio: string; // ISO
  lida: boolean;
  lidaPorId?: string; // id de quem leu (atendente)
}
