# Vínculo Atendimento — instrutor (padrão) x personal

**Módulo:** Profissional
**Ator:** Admin (cria o vínculo) / Profissional (usa o vínculo)
**Status:** Já implementado (simulado)

## Descrição
A distinção entre instrutor e personal trainer não está no cadastro da pessoa (`Profissional`), está no **vínculo** com cada aluno (`Atendimento`).

## Regras de negócio
- Todo aluno tem pelo menos um vínculo `standard` (instrutor, incluso no plano).
- Pode, adicionalmente, ter um vínculo `personal` (serviço cobrado a mais, com `value` próprio).
- O mesmo profissional pode ser instrutor de um aluno e personal de outro — a distinção vive no vínculo, não na pessoa.
- Instrutores e personais são ambos funcionários da própria academia — não existe personal freelancer modelado hoje.
