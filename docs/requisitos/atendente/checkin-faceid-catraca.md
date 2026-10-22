# Check-in — Face ID / catraca

**Módulo:** Atendente
**Ator:** Atendente (ou totem/catraca, no futuro)
**Status:** Já implementado (simulado)

## Descrição
Buscar aluno (por CPF/nome) e registrar check-in de entrada, com acesso liberado ou bloqueado conforme regra de inadimplência.

## Critério de aceite
- Check-in grava: aluno, timestamp, método (`faceId` ou `manual`), e o resultado da regra de acesso naquele instante.

## Regras de negócio relacionadas
- **Acesso liberado é calculado, não é um campo salvo isolado:** aluno tem acesso liberado se **não** possui nenhum pagamento com status `atrasado`. Cada check-in recalcula essa regra no momento e grava o resultado como fotografia histórica — a regra em si nunca é armazenada separada.
- Status do aluno (`active`/`cancelled`) é independente do bloqueio por inadimplência — um aluno `active` pode mesmo assim ter acesso bloqueado por atraso. São duas regras distintas.
- Face ID aqui é simulado (ver nota em `cadastro-face-id.md`) — identificação real hoje é busca por CPF/nome, câmera é só preview visual.
