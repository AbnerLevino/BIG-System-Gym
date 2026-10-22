# RF-ATD-04/05/06/07 — Confirmação de pagamento e ativação de conta do aluno

**Módulo:** Atendente
**Ator:** Atendente / Sistema
**Status:** Em design — ainda não implementado

## Descrição
Fluxo completo: o atendente registra o pagamento da primeira mensalidade, o sistema libera a matrícula e gera automaticamente um convite de ativação de conta pro aluno. A senha nunca é definida pelo atendente — só pelo próprio aluno, depois, no celular.

## Passo a passo

1. **Confirmação de pagamento** — atendente registra o pagamento recebido no balcão. Enquanto não confirmado, aluno fica sem acesso ao sistema.
2. **Geração do convite** — ao confirmar o pagamento, o sistema cria o `Usuario` do aluno (e-mail informado pelo atendente) em estado "pendente de senha", com um token de ativação aleatório, único, expirando em 48h.
3. **Confirmação do e-mail na tela** — antes de finalizar, o e-mail digitado pelo atendente é exibido numa tela que o próprio aluno confere (reduz risco de erro de digitação, já que o e-mail é falado, não digitado pelo dono dele).
4. **Reenvio/correção** — se o aluno não receber o convite (e-mail errado), o atendente corrige o e-mail e gera um novo token, sem duplicar o cadastro. O token anterior é invalidado.

## Critério de aceite
- `Usuario` criado não permite login até a senha ser definida (ver `docs/requisitos/aluno/criacao-senha-ativacao.md`).
- Se o e-mail já existir no sistema, cadastro é bloqueado com erro claro antes de confirmar o pagamento.
- Corrigir o e-mail invalida o token anterior e gera um novo, associado ao mesmo `Usuario`.

## Regras de negócio relacionadas
- Conta de acesso só é criada/liberada após confirmação de pagamento — nunca antes.
- Token de ativação é de uso único e expira em 48h.

## Dependência de infraestrutura
Esse fluxo depende de envio de e-mail (ou WhatsApp) real, que não existe na fase front-end atual. Até existir backend com serviço de e-mail, simular mostrando o link de ativação na própria tela do atendente (igual aos atalhos de demonstração do login), deixando isso marcado como simulado.

## Segurança — não esquecer na implementação
O link de ativação precisa carregar um token aleatório validado pelo servidor, nunca `?email=...` sozinho — senão qualquer pessoa que descubra o e-mail de um aluno poderia criar a senha da conta dele.
