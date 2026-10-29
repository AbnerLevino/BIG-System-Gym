# RF-ADM-02/03 — Cadastro e gestão de funcionários (RH)

**Módulo:** Admin
**Ator:** Admin
**Status:** Em design — `Atendente`/`Profissional` só têm os campos básicos hoje (nome, CPF, telefone, cargo/especialização)

## Descrição
Estender `Atendente` e `Profissional` com os campos de RH (D9) e criar telas de cadastro/edição/listagem em `/admin/profissionais` (path já previsto no `Sidebar.tsx`) — incluindo também a gestão de atendentes nessa tela, ou numa sub-rota equivalente a decidir com o grupo.

## RF-ADM-02 — Campos de RH (decisão já fechada — D9)
Cadastro completo de funcionário (`Atendente` e `Profissional`) precisa de:
nome completo, CPF, RG, endereço, telefone, contato de emergência, dados bancários, tipo de contratação, cargo/função, data de admissão, valor de salário, e **CREF** (só em `Profissional`, campo opcional).

E-mail de login já existe via `Usuario.email` — **não duplicar** com um e-mail de contato separado, a menos que surja necessidade real.

## Onde mexer
- `src/types/atendente.ts` — hoje só `{ id, name, cpf, phone, cargo, photoUrl? }`; adicionar os campos de RH.
- `src/types/profissional.ts` — hoje só `{ id, name, cpf, phone, birthDate, baseType, specialization, notes }`; adicionar os campos de RH + `cref?: string`.
- `src/data/atendenteRepository.ts` e `src/data/profissionalRepository.ts` (já existem — ajustar pro novo formato).
- Telas novas em `src/features/admin/`.

## Onde NÃO mexer
- **RF-ADM-03 — Fora de escopo nesta rodada (D10):** não criar módulo de contas a pagar (salário + despesas da academia). Esta rodada cobre só o cadastro de dados do funcionário; folha de pagamento/despesas fica pra uma task futura, com levantamento de regra próprio (categoria de despesa, recorrência, quem lança/aprova).

## Critério de aceite
- Cadastro de `Atendente`/`Profissional` exige todos os campos de RH listados acima (D9), exceto CREF que é opcional e só aparece em `Profissional`.
- Como `Atendente` e `Profissional` já são entidades existentes, o grupo é avisado antes de alterar o formato (regra de ouro 3 do contexto mestre) — este requisito já é esse aviso formal.
- Nenhuma tela desta task cria ou edita lançamento financeiro de salário/despesa.
