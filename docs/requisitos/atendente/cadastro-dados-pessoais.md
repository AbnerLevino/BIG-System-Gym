# RF-ATD-01 — Cadastro de dados pessoais do aluno

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Já implementado (simulado, localStorage)

## Descrição
O atendente deve conseguir cadastrar nome completo, CPF, data de nascimento, telefone, endereço, peso e altura do aluno.

## Critério de aceite
- Campos obrigatórios: nome completo, CPF, telefone.
- CPF é validado (formato + dígito verificador) antes de salvar.
- Sistema impede salvar CPF já existente, com mensagem de erro clara.

## Regras de negócio relacionadas
- CPF é identificador imutável do aluno após criado (não editável em `edicao-cancelamento-aluno.md`).
