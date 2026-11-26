# Módulo 2 — Atendente

> Antes de pedir código pra IA: cole o bloco CONTEXTO MESTRE de `00-contexto-mestre.md` primeiro, depois cole o item abaixo que você for fazer.

**Contrato que este módulo consome:** `alunoEstaInadimplente(alunoId)` do Módulo 1 (Fundação), pra bloquear check-in.

## Checklist

- [x] **RF-ATD-01 — Cadastro de dados pessoais** — já implementado (simulado). Campos obrigatórios: nome completo, CPF, telefone. CPF validado (formato + dígito verificador), impede duplicado, e é imutável depois de criado.
- [x] **RF-ATD-02 — Cadastro de matrícula** — já implementado (simulado). Só vincula a plano ativo; data de início não pode ser anterior à atual; ao salvar, aluno passa de `trial` para `active`. Trocas de plano ao longo do tempo ficam em `HistoricoPlano`, sem reescrever histórico financeiro. Plano via parceiro (TotalPass/Wellhub) já nasce pago automaticamente (regra existente, não é desta rodada).
- [x] **RF-ATD-03 — Cadastro de Face ID** — já implementado (simulado). Opcional no cadastro; exige ao menos uma foto com rosto detectado. ⚠️ **Importante pra apresentação:** a câmera só faz preview visual de "reconhecendo" — não há modelo de reconhecimento facial de verdade rodando; a identificação real hoje é busca por CPF/nome. Isso precisa ficar explícito na fala, não pode ser apresentado como biometria funcionando de verdade. LGPD: biometria facial é dado sensível (art. 5º, II) — exige consentimento explícito e específico, não o mesmo aceite de termos genérico do cadastro.
- [x] **RF-ATD-08 — Pesquisa de aluno** — já implementada. Busca por nome, CPF ou e-mail, parcial (filtra ao digitar); sem resultado mostra mensagem clara, não tela vazia.
- [x] **RF-ATD-09 — Consulta de detalhes do aluno** — já implementada. Mostra numa única tela: dados pessoais, plano atual, status de pagamento e status da matrícula.

- [ ] **RF-ATD-10 — Edição de dados do aluno**

  **Descrição:** editar dados pessoais e de plano de um aluno já cadastrado.

  **Onde mexer:** `src/features/attendant/` (telas existentes de busca/consulta).

  **Critério de aceite:**
  - CPF não é editável por aqui — é identificador imutável (mudança de CPF, se necessária, é fluxo administrativo separado, fora de escopo).

- [ ] **RF-ATD-11 — Cancelamento de matrícula**

  **Descrição:** marcar a matrícula como `cancelled`. Acesso do aluno ao sistema é bloqueado a partir da data de cancelamento.

  **Onde mexer:** `src/features/attendant/`.

  **Onde NÃO mexer:** `src/types/aluno.ts` (o `status: 'trial' | 'active' | 'cancelled'` já existe, não precisa de campo novo).

- [ ] **RF-ATD-04/05/06/07 — Confirmação de pagamento e ativação de conta do aluno**

  **Descrição:** fluxo completo: o atendente registra o pagamento da primeira mensalidade, o sistema libera a matrícula e gera automaticamente um convite de ativação de conta pro aluno. A senha nunca é definida pelo atendente — só pelo próprio aluno, depois, no celular.

  **Passo a passo:**
  1. **Confirmação de pagamento** — atendente registra o pagamento recebido no balcão. Enquanto não confirmado, aluno fica sem acesso ao sistema.
  2. **Geração do convite** — ao confirmar o pagamento, o sistema cria o `Usuario` do aluno (e-mail informado pelo atendente) em estado "pendente de senha", com um token de ativação aleatório, único, expirando em 48h.
  3. **Confirmação do e-mail na tela** — antes de finalizar, o e-mail digitado pelo atendente é exibido numa tela que o próprio aluno confere (reduz risco de erro de digitação, já que o e-mail é falado, não digitado pelo dono dele).
  4. **Reenvio/correção** — se o aluno não receber o convite (e-mail errado), o atendente corrige o e-mail e gera um novo token, sem duplicar o cadastro. O token anterior é invalidado.

  **Critério de aceite:**
  - `Usuario` criado não permite login até a senha ser definida (ver `05-aluno-conta-treino.md`, item RF-ALU-01).
  - Se o e-mail já existir no sistema, cadastro é bloqueado com erro claro antes de confirmar o pagamento.
  - Corrigir o e-mail invalida o token anterior e gera um novo, associado ao mesmo `Usuario`.

  **Dependência de infraestrutura:** esse fluxo depende de envio de e-mail (ou WhatsApp) real, que não existe na fase front-end atual. Até existir backend com serviço de e-mail, simular mostrando o link de ativação na própria tela do atendente (igual aos atalhos de demonstração do login), deixando isso marcado como simulado.

  **Segurança — não esquecer na implementação:** o link de ativação precisa carregar um token aleatório validado pelo servidor, nunca `?email=...` sozinho — senão qualquer pessoa que descubra o e-mail de um aluno poderia criar a senha da conta dele.

- [ ] **Bloqueio de check-in por inadimplência**

  **Descrição:** consumir `alunoEstaInadimplente()` do Módulo 1 em `AttendantCheckinPage.tsx`, usando a mensagem `latePayment` já reservada no código (hoje existe mas não é usada), pra bloquear o check-in do aluno em atraso (D4).
