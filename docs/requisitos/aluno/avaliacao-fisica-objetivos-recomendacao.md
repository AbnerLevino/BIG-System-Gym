# RF-ALU-06/07/08 — Avaliação física: objetivos, metas e recomendação de exercício

**Módulo:** Aluno
**Ator:** Aluno
**Status:** Em design — conflito de nome com entidade existente (ver nota técnica)

## Descrição
O aluno deve conseguir:
1. Responder um questionário sobre objetivo (ex: perder peso, ganhar massa) e definir uma meta.
2. Selecionar um ou mais grupos musculares que deseja melhorar (seleção múltipla).
3. Visualizar os exercícios correspondentes aos grupos selecionados, com nome, descrição e dificuldades técnicas/físicas.

## Critério de aceite
- Seleção de grupo muscular permite múltipla escolha simultânea.
- Lista de exercícios recomendados é a união dos exercícios de todos os grupos selecionados, sem duplicar exercício que pertence a mais de um grupo.

## Nota técnica — conflito de nome com o que já existe
Já existe uma entidade `AvaliacaoFisica` no sistema (`src/types/avaliacaoFisica.ts`), mas ela representa outra coisa: um registro de medidas corporais (peso, medidas em cm) feito **pelo profissional**, não um questionário de objetivos respondido pelo próprio aluno. São dois conceitos diferentes com nome parecido — precisam de nomes distintos no código (ex: `QuestionarioObjetivo` vs `AvaliacaoFisicaMedidas`) pra não colidir. Ver `docs/requisitos/profissional/metas-avaliacao-fisica-profissional.md`.

## Questão aberta — decisão de negócio pendente
**Qual é a regra exata de correspondência entre objetivo/grupo muscular selecionado e exercício recomendado?** Hoje está descrito como "mostra os exercícios correspondentes" — precisa virar uma regra explícita (tabela exercício → grupo muscular → nível recomendado por objetivo) antes de implementar. Isso é o motor de recomendação do sistema, não uma tela simples de listagem.
