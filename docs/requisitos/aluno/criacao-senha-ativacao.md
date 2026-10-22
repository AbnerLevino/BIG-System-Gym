# RF-ALU-01 — Criação de senha (ativação de conta)

**Módulo:** Aluno
**Ator:** Aluno
**Status:** Em design — ainda não implementado

## Descrição
Ao abrir o link do convite recebido (ver `docs/requisitos/atendente/ativacao-conta-acesso.md`), o aluno deve conseguir definir a própria senha e acessar o sistema, direto pelo celular.

## Depende de
- `docs/requisitos/atendente/ativacao-conta-acesso.md`

## Critério de aceite
- Dado que o token do link é válido e não expirado, quando o aluno define uma senha, então a conta passa a aceitar login normal e o token é invalidado (uso único).
- Dado que o token está expirado ou já foi usado, quando o aluno abre o link, então o sistema mostra erro e orienta a pedir novo convite ao atendente.

## Fluxo completo (dos dois lados)
Esse requisito é a segunda metade de um fluxo de dois passos, intencionalmente separado: o atendente fecha a matrícula e o pagamento (lado dele); o aluno, depois, sozinho, no próprio celular, cria a própria credencial (lado dele). Nenhum atendente vê ou define a senha do aluno.
