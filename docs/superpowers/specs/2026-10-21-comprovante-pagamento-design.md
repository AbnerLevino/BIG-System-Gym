# Comprovante de Pagamento — Design

**Contexto:** o fluxo de cadastro presencial do Atendente (`AttendantCadastroPage.tsx`)
já tem uma etapa `'pagamento'` que usa `PagamentoCheckout.tsx` (Pix/cartão/dinheiro,
motor em `pagamentoService.ts`). Hoje, ao aprovar o pagamento, o componente baixa um PDF
automaticamente (`gerarReciboPDF`) e já avança pra etapa `'captura'` (FaceID). Este design
troca isso por uma tela de confirmação visual — o "comprovante" — exibida dentro da própria
etapa de pagamento, no estilo de apps de pagamento modernos (Nubank e similares), antes de
avançar pro FaceID.

**Por que isso importa:** o comprovante serve dois papéis ao mesmo tempo — prova de
pagamento pro aluno (ele vê que pagou) e confirmação pro atendente (ele sabe que pode
seguir pro cadastro do rosto). O PDF deixa de ser automático e passa a ser opcional
(botão "baixar"), porque a tela já cumpre o papel de confirmação.

## Decisões de arquitetura

**Localização do código:** `PagamentoCheckout.tsx` sai de `src/features/attendant/` e
vai para uma pasta nova `src/components/pagamento/`, junto de um novo
`ComprovantePagamento.tsx`. Motivo: o `CONTRIBUTING.md` deste projeto proíbe uma feature
importar de outra feature (ex: `attendant` não pode importar de `subscriber`). O comprovante
e o checkout vão ser reusados futuramente pela feature do Aluno pagando sozinho (fora de
escopo deste design) — colocando-os em `components/`, qualquer feature pode importar sem
duplicar código ou violar a regra.

**Máquina de estados do `PagamentoCheckout`:** a etapa externa do wizard
(`AttendantCadastroPage`) permanece em `'pagamento'` do início ao fim deste fluxo — ela não
sabe nada sobre o que acontece "por dentro". Internamente, o componente cicla por:

```
selecionando → processando → check (~0.6s) → aprovado (mostra comprovante)
                   ↓ (10% recusa)
                recusado → volta pra selecionando (com mensagem de erro)
```

Só quando o atendente clica em "Continuar" (depois de ver o comprovante) o componente
chama `onAprovado(pagamentoAtualizado)`, e só aí o wizard externo avança pra `'captura'`.

**Separação checkout vs. comprovante:** `PagamentoCheckout.tsx` cuida de cobrar (seleção de
método, inputs, chamada ao `pagamentoService`). `ComprovantePagamento.tsx` é puramente
visual — recebe os dados já prontos (via props) e só renderiza. Isso significa que o
componente de comprovante não sabe nada sobre como o pagamento foi processado, e pode ser
testado/reusado isoladamente.

## Layout do comprovante

Sem moldura de "folha de papel" — é um bloco grande, direto na página, sem `Card` com fundo
destacado:

```
          [btn: Baixar comprovante ↓]   (canto superior)

                  [ícone BigGym]

                    ✓ (verde)
             Pagamento aprovado          (bold, Instrument Sans, grande)
                  R$ 99,90               (menor, opacidade reduzida)
             ───────────────────
  Aluno            Ana Souza
  CPF              123.456.789-00
  Plano            Mensal
  Forma de pagamento    Cartão de crédito
  Bandeira          Visa •••• 4242
  Data do pagamento     21/10/2026
  Próximo vencimento    21/11/2026
  Comprovante nº        CMP-0001

           [btn: Continuar para cadastro do rosto]
```

Pra Pix, a linha "Bandeira" é substituída por "Chave Pix: academia@biggym.com". Pra
dinheiro, nenhuma linha extra aparece.

**Bandeira do cartão:** detectada por heurística simples no primeiro dígito do número
(`4` → Visa, `5` → Mastercard, outro → "Cartão"). Isso é uma identificação real (não um
"banco" inventado) — os dados completos do cartão nunca saem do estado local do componente
de checkout; só a bandeira e os últimos 4 dígitos (strings derivadas) são passados pro
comprovante.

**Próximo vencimento:** calculado na hora da exibição como `dataDoPagamento + 1 mês`, só
para exibição — não cria um novo registro de `Pagamento`. A cobrança recorrente de verdade
é responsabilidade de uma feature futura (Task 9 da Fase A, ainda não implementada).

**Cor:** o check de aprovação e os destaques de sucesso usam verde (convenção universal de
"pago"), não a cor de marca (`rose-800`), para destoar intencionalmente e comunicar
confirmação de forma reconhecível.

## Renomeações (não é mais "recibo")

- `gerarReciboPDF` → `gerarComprovantePDF` em `pagamentoService.ts` (texto do PDF também
  muda de "Recibo de Pagamento" para "Comprovante de Pagamento").
- `proximoNumeroRecibo` → `proximoNumeroComprovante`, prefixo `REC-` → `CMP-`.
- O campo `Pagamento.receiptNumber` (tipo) não muda de nome — é um nome técnico interno já
  estabelecido; só o texto exibido na tela e os textos gerados (PDF, prefixo) mudam.

## Novas funções e componentes

- `detectarBandeiraCartao(numero: string): string` em `src/utils/mascaras.ts`.
- `ComprovantePagamento` (novo componente, `src/components/pagamento/ComprovantePagamento.tsx`),
  props: `pagamento: Pagamento`, `nomeAluno: string`, `cpf: string`, `planoNome: string`,
  `bandeira?: string`, `ultimosDigitos?: string`, `onContinuar: () => void`.
- `PagamentoCheckout` ganha os props `cpf: string` e `planoNome: string` (além dos já
  existentes `pagamento`, `nomeAluno`, `onAprovado`), pra poder passá-los pro
  `ComprovantePagamento`.

## Fora de escopo

- Pagamento feito pelo próprio Aluno (feature futura, separada).
- Cobrança de mensalidade recorrente (Task 9 da Fase A).
- Qualquer integração real de gateway de pagamento — tudo continua simulado.
