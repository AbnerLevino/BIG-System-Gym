# Metas e avaliação física (medidas) — registradas pelo profissional

**Módulo:** Profissional
**Ator:** Profissional
**Status:** Já implementado (simulado) — **nome em conflito com nova feature do aluno, ver nota**

## Descrição
- **Meta:** profissional define meta de peso/medida/frequência pra um aluno, com prazo e status (`inProgress`/`completed`/`late`).
- **AvaliacaoFisica (medidas):** profissional registra peso e medidas corporais do aluno num ponto no tempo, usado no gráfico de evolução (`docs/requisitos/aluno/evolucao-fisica-grafico.md`).

## Regras de negócio
- **Metas são restritas a alunos com vínculo `personal` ativo** — só o Personal cria/gerencia metas (reflexo da autonomia desse serviço dedicado; o instrutor padrão orienta, não define metas individuais).

## Conflito a resolver
Essa `AvaliacaoFisica` (medidas corporais, feita pelo profissional) tem nome muito parecido com o novo requisito `docs/requisitos/aluno/avaliacao-fisica-objetivos-recomendacao.md` (questionário de objetivos respondido pelo próprio aluno) — são conceitos diferentes. Resolver nomenclatura antes de implementar a feature nova, pra não colidir tipos/telas.
