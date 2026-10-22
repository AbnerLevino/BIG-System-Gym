# RF-ATD-08/09/10/11 — Pesquisa, consulta, edição e cancelamento de aluno

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Pesquisa/consulta já implementadas; edição/cancelamento a confirmar no código atual.

## RF-ATD-08 — Pesquisa de aluno
Buscar aluno por nome, CPF ou e-mail. Busca parcial (filtra ao digitar); sem resultado mostra mensagem clara, não tela vazia.

## RF-ATD-09 — Consulta de detalhes do aluno
Visualizar numa única tela: dados pessoais, plano atual, status de pagamento e status da matrícula.

## RF-ATD-10 — Edição de dados do aluno
Editar dados pessoais e de plano de um aluno já cadastrado.
**Critério de aceite:** CPF não é editável por aqui — é identificador imutável (mudança de CPF, se necessária, é fluxo administrativo separado, fora de escopo).

## RF-ATD-11 — Cancelamento de matrícula
Marcar a matrícula como `cancelled`. Acesso do aluno ao sistema é bloqueado a partir da data de cancelamento.
