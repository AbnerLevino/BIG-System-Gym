// Convite de ativação de conta (RF-ATD-04/05/06/07 + RF-ALU-01). Gerado quando o
// pagamento da matrícula é confirmado; o aluno usa o token pra criar a própria
// senha. Uso único, expira em 48h. Um Usuario "pendente de senha" é o que tem
// password vazio — o tipo Usuario em si não muda.
export interface ConviteAtivacao {
  id: string
  usuarioId: string
  token: string
  criadoEm: string
  expiraEm: string
  usadoEm: string | null
  // Preenchido quando um convite novo substitui este (ex: e-mail corrigido).
  invalidadoEm: string | null
}
