# RF-ATD-03 — Cadastro de Face ID do aluno

**Módulo:** Atendente
**Ator:** Atendente
**Status:** Já implementado (simulado — ver nota abaixo)

## Descrição
O atendente deve capturar e associar a biometria facial do aluno ao cadastro, pra uso posterior no check-in (ver `checkin-faceid-catraca.md`).

## Depende de
- `cadastro-dados-pessoais.md`

## Critério de aceite
- Captura exige no mínimo uma foto com rosto detectado — não salva se nenhum rosto for reconhecido no frame.
- Face ID é opcional no momento do cadastro — aluno pode ser cadastrado sem e completar depois.

## Nota técnica importante
A implementação atual usa a câmera do navegador só pra preview visual de "reconhecendo"; não há modelo de reconhecimento facial de verdade rodando — a identificação real, hoje, é busca por CPF/nome. Isso precisa continuar explícito em qualquer apresentação do projeto (o que é real vs. simulado).

## Regras de negócio relacionadas (LGPD)
- Biometria facial é **dado sensível** pela LGPD (art. 5º, II). Exige consentimento explícito e específico do aluno — não cobre pelo mesmo "aceite de termos" genérico do cadastro.
- Quando migrar pra backend real: nunca guardar imagem crua/embedding em texto claro acessível por query simples — avaliar hash/criptografia e acesso restrito antes de sair da fase simulada.
