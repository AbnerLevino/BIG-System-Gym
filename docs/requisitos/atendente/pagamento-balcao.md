# Pagamento recebido no balcão

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Já implementado (simulado)

## Descrição
Registrar o pagamento de uma mensalidade recebida presencialmente no balcão (dinheiro, cartão, Pix).

## Regras de negócio relacionadas
- É a única forma de lançamento manual de `Pagamento` no sistema — todo o resto é gerado automaticamente a partir do plano vigente (ver `docs/requisitos/admin/financeiro-calculo-pagamento-regras.md`).
- Pagamento aprovado gera recibo em PDF com numeração sequencial.
- Simulação do processamento para na fronteira do "processar pagamento" (delay artificial + aprova ou recusa) — nenhuma integração real de gateway ainda.
