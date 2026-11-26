    # Requisitos de RH — documento simples, para quem não é da área de tecnologia

    **O que é este documento:** uma lista do que um módulo de **RH (Recursos Humanos)** faria dentro do BigGym, explicada em português do dia a dia, sem termos técnicos de programação. Serve para qualquer pessoa do grupo, do professor ou de banca entender **o que o sistema faria e por quê**, sem precisar entender código.

    **Importante:** como o BigGym é um trabalho de faculdade (não um sistema real vendido pra academias), este documento já reduz a lista de ideias originais para o que faz sentido num projeto acadêmico — dando prioridade ao que é simples de explicar e de mostrar funcionando. Itens que foram deixados de fora (ou simplificados) estão marcados como **"fora do escopo"**, com o motivo.

    ---

    ## Glossário rápido (palavras que aparecem abaixo)

    | Palavra | O que significa, em termos simples |
    |---|---|
    | Colaborador | Qualquer pessoa que trabalha na academia (professor, recepcionista, gestor) |
    | CREF | O "registro profissional" obrigatório de quem dá aula de educação física, parecido com a OAB de advogado |
    | Comissão | Dinheiro extra que a pessoa ganha por vender um plano ou renovar a matrícula de um aluno |
    | Onboarding | O processo de receber e ensinar um funcionário novo nos primeiros dias |
    | KPI | Um número simples que mostra se algo está indo bem (ex: "quantos treinos o professor montou este mês") |

    ---

    ## 1. Cadastro dos funcionários

    **Por que isso existe:** a academia precisa de um lugar só para guardar as informações de quem trabalha ali — hoje em dia isso normalmente fica espalhado em papel ou planilha.

    - **Ficha do colaborador.** Cada funcionário tem uma ficha com: nome, cargo (professor, recepcionista, gestor...), tipo de contrato, data em que começou a trabalhar e o salário. Se algo mudar (por exemplo, um aumento de salário ou troca de cargo), o sistema guarda esse histórico, em vez de simplesmente apagar a informação antiga.
    - **Registro profissional (CREF) do professor.** Quem dá aula precisa ter um CREF válido. O sistema guarda o número do CREF e avisa com antecedência quando ele estiver perto de vencer — assim a academia não corre o risco de ter um professor dando aula com o registro vencido sem perceber.
    - **Documentos do funcionário.** Um espaço para guardar, de forma digital, o contrato de trabalho e outros documentos básicos da pessoa, em vez de ficar só em papel numa pasta física.

    > **Simplificado:** a lista original também pedia controle de exame médico admissional e de entrega de uniforme/equipamento. Para este projeto, isso foi deixado de fora — a ideia de "guardar documento digital" já é demonstrada com o contrato de trabalho, não é preciso repetir a mesma função para cada tipo de documento.

    ---

    ## 2. Horário de trabalho

    **Por que isso existe:** numa academia, cada funcionário trabalha em horários diferentes (manhã, tarde, fim de semana), e a gestão precisa saber quem está de serviço em cada horário.

    - **Grade de horário semanal.** Cada funcionário tem um horário fixo por semana (ex: "segunda a sexta, das 8h ao meio-dia"), visível pela gestão.
    - **Registro simples de entrada e saída.** Uma marcação (simulada, sem precisar de catraca ou leitor biométrico de verdade) de quando o funcionário chegou e saiu no dia.

    > **Simplificado:** a ideia original também incluía cálculo automático de hora extra, adicional noturno e "banco de horas". Isso é uma conta bem específica da área de folha de pagamento, que exigiria muitas regras só para esse cálculo — fora de escopo aqui. O sistema mostra o horário e a marcação de ponto, mas não faz esse tipo de cálculo de folha de pagamento.

    ---

    ## 3. Pagamento por produtividade

    **Por que isso existe:** em muitas academias, parte do salário de professores e recepcionistas depende do que eles entregam (aulas dadas, vendas feitas), não só de um valor fixo.

    - **Pagamento por aula dada.** Para professores de aula coletiva (ginástica, luta, natação), o sistema soma quantas aulas a pessoa deu no mês e calcula quanto ela deve receber por isso.
    - **Comissão de vendas.** Para recepcionistas e consultores, o sistema calcula um valor extra com base em quantas matrículas ou renovações de plano aquela pessoa fechou.

    > **Simplificado:** a ideia de "bônus por reter aluno e evitar cancelamento" foi deixada de fora — é uma regra de negócio mais avançada (bateria de metas, acompanhamento de longo prazo) que não é necessária para mostrar o conceito de pagamento por produtividade.

    ---

    ## 4. Contratação e treinamento de pessoal novo

    **Por que isso existe:** quando a academia contrata alguém, precisa de um processo organizado desde a entrevista até a pessoa estar pronta para atender os alunos sozinha.

    - **Acompanhamento de candidatos.** Uma lista simples dos candidatos a uma vaga, com o status de cada um (ex: "currículo recebido", "entrevista marcada", "aprovado").
    - **Checklist dos primeiros dias.** Uma lista de tarefas que o funcionário novo precisa concluir antes de começar a atender alunos sozinho (ex: "assistir ao treinamento de atendimento", "conhecer o sistema").
    - **Histórico de treinamentos feitos.** Um registro simples dos cursos e treinamentos que cada funcionário já concluiu.

    ---

    ## 5. Avaliação e controle de acesso

    **Por que isso existe:** a gestão precisa acompanhar se a equipe está indo bem, e cada pessoa só deve ver as informações que fazem sentido para o seu trabalho.

    - **Indicadores simples de desempenho (KPIs).** Um número fácil de entender por professor, como "quantas avaliações físicas esse professor fez este mês" — não é um relatório complexo, é só um placar simples.
    - **Conversas periódicas entre gestor e funcionário.** Um espaço para marcar e anotar reuniões de acompanhamento (o famoso "1 a 1"), com data e um resumo do que foi conversado.
    - **Cada pessoa só vê o que precisa ver.** Isso já existe no restante do BigGym: recepcionista não vê dados financeiros da academia, por exemplo. No módulo de RH, o mesmo princípio vale para dados de salário — só a gestão vê o salário dos outros, nunca um colaborador comum.

    > **Simplificado:** o registro técnico de "log de auditoria" (um histórico de toda alteração feita no sistema, útil para investigar problemas) foi deixado de fora — é mais uma preocupação de segurança de sistemas reais em produção do que algo necessário para demonstrar o projeto da faculdade.

    ---

    ## Resumo em uma frase por item

    | # | Requisito | Em uma frase |
    |---|---|---|
    | 1 | Ficha do colaborador | Guardar os dados de quem trabalha na academia, com histórico de mudanças |
    | 2 | CREF do professor | Avisar antes do registro profissional do professor vencer |
    | 3 | Documentos do funcionário | Guardar o contrato de trabalho digitalmente |
    | 4 | Horário semanal | Saber o horário fixo de cada funcionário |
    | 5 | Registro de ponto | Marcar simuladamente a entrada e saída do dia |
    | 6 | Pagamento por aula | Calcular quanto o professor recebe pelas aulas que deu |
    | 7 | Comissão de vendas | Calcular o valor extra de quem vendeu matrícula/renovação |
    | 8 | Candidatos a vaga | Acompanhar o processo de contratação de alguém novo |
    | 9 | Checklist de entrada | Lista de tarefas do funcionário novo antes de atender alunos |
    | 10 | Histórico de treinamentos | Guardar os cursos que cada funcionário já fez |
    | 11 | Indicador simples (KPI) | Um placar fácil de entender sobre o desempenho do professor |
    | 12 | Conversa 1 a 1 | Agendar e anotar reuniões entre gestor e funcionário |
    | 13 | Acesso por cargo | Cada pessoa só vê o que precisa ver (ex: salário só para a gestão) |
