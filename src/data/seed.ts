// Dados de exemplo que populam o sistema na primeira vez que alguém abre o app
// (consumidos por ensureSeeded nos *Repository.ts). Sem isso o app abriria vazio.
import type {
  Usuario,
  Academia,
  Profissional,
  Atendente,
  Aluno,
  Plano,
  Pagamento,
  Atendimento,
  Treino,
  Exercicio,
  Meta,
  AvaliacaoFisica,
  CheckIn,
} from '../types'

export const seedAcademias: Academia[] = [
  { id: 'gym-1', name: 'BigGym Centro', address: 'Rua das Academias, 100', phone: '(11) 4000-0000' },
]

export const seedPlanos: Plano[] = [
  { id: 'plan-1', name: 'Mensal Basico', price: 99.9, modalities: ['Musculacao'], conditions: 'Sem fidelidade', origin: 'direct' },
  { id: 'plan-2', name: 'Trimestral Plus', price: 259.9, modalities: ['Musculacao', 'Funcional'], conditions: '3 meses, 10% de desconto', origin: 'direct' },
]

export const seedProfissionais: Profissional[] = [
  {
    id: 'prof-1',
    name: 'Carla Mendes',
    cpf: '111.111.111-11',
    phone: '(11) 90000-0001',
    birthDate: '1990-04-12',
    baseType: 'instructor',
    specialization: 'Musculacao',
    notes: '',
  },
  {
    id: 'prof-2',
    name: 'Bruno Alves',
    cpf: '222.222.222-22',
    phone: '(11) 90000-0002',
    birthDate: '1988-09-03',
    baseType: 'personalTrainer',
    specialization: 'Treinamento funcional',
    notes: '',
  },
]

export const seedAtendentes: Atendente[] = [
  { id: 'attendant-1', name: 'Paula Rocha', cpf: '555.555.555-55', phone: '(11) 90000-0003', cargo: 'Recepcao' },
]

export const seedAlunos: Aluno[] = [
  {
    id: 'sub-1',
    fullName: 'Joao Pereira',
    weight: 82,
    height: 178,
    phone: '(11) 98888-0001',
    cpf: '333.333.333-33',
    address: 'Rua A, 10',
    birthDate: '1995-02-20',
    notes: '',
    planoAtualId: 'plan-1',
    startDate: '2026-01-10',
    status: 'active',
  },
  {
    id: 'sub-2',
    fullName: 'Marina Souza',
    weight: 65,
    height: 165,
    phone: '(11) 98888-0002',
    cpf: '444.444.444-44',
    address: 'Rua B, 20',
    birthDate: '1998-07-15',
    notes: '',
    planoAtualId: 'plan-2',
    startDate: '2026-02-01',
    status: 'active',
  },
]

export const seedPagamentos: Pagamento[] = [
  {
    id: 'pay-1',
    academiaId: 'gym-1',
    alunoId: 'sub-1',
    planoId: 'plan-1',
    originalValue: 99.9,
    paidValue: 99.9,
    lateFee: 0,
    paymentMethod: 'pix',
    dueDate: '2026-10-10',
    paymentDate: '2026-10-09',
    status: 'paid',
    receiptNumber: 'REC-0001',
  },
  {
    id: 'pay-2',
    academiaId: 'gym-1',
    alunoId: 'sub-2',
    planoId: 'plan-2',
    originalValue: 259.9,
    paidValue: null,
    lateFee: 0,
    paymentMethod: null,
    dueDate: '2026-11-01',
    paymentDate: null,
    status: 'pending',
    receiptNumber: null,
  },
]

export const seedAtendimentos: Atendimento[] = [
  { id: 'assign-1', alunoId: 'sub-1', profissionalId: 'prof-1', type: 'standard' },
  { id: 'assign-2', alunoId: 'sub-2', profissionalId: 'prof-1', type: 'standard' },
  { id: 'assign-3', alunoId: 'sub-1', profissionalId: 'prof-2', type: 'personal', value: 150 },
]

export const seedTreinos: Treino[] = [
  {
    id: 'workout-1',
    alunoId: 'sub-1',
    atendimentoId: 'assign-1',
    week: 1,
    exercises: [
      { name: 'Supino reto', sets: 4, reps: 10 },
      { name: 'Agachamento', sets: 4, reps: 12 },
    ],
    startDate: '2026-10-01',
    active: true,
    origin: 'manual',
  },
  {
    id: 'workout-2',
    alunoId: 'sub-2',
    atendimentoId: 'assign-2',
    week: 1,
    exercises: [
      { name: 'Leg press', sets: 3, reps: 15 },
      { name: 'Puxada alta', sets: 3, reps: 12 },
    ],
    startDate: '2026-10-05',
    active: true,
    origin: 'manual',
  },
]

export const seedExercicios: Exercicio[] = [
  {
    id: 'supino-inclinado-barra-pegada-media',
    nome: 'Supino inclinado com barra - pegada média',
    descricao:
      'Deitado no banco inclinado, pegada na barra um pouco mais larga que os ombros. Desça a barra devagar até tocar a parte superior do peito, pause e empurre de volta estendendo os braços, contraindo o peitoral no topo do movimento.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/3TZduzM.gif',
  },
  {
    id: 'agachamento-livre-barra',
    nome: 'Agachamento livre com barra',
    descricao:
      'Barra apoiada na parte superior das costas, pés na largura dos ombros. Desça flexionando quadril e joelhos até as coxas ficarem paralelas ao chão, peito erguido e joelhos alinhados com os pés. Suba empurrando o chão com os calcanhares.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/Gnfo4FM.gif',
  },
  {
    id: 'puxada-frontal-polia',
    nome: 'Puxada frontal na polia',
    descricao:
      'Sentado de frente para o aparelho, pegada aberta na barra. Puxe até a altura do queixo contraindo as costas e levando os cotovelos para baixo. Retorne controlando o peso até o braço estender por completo.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/LEprlgG.gif',
  },
  {
    id: 'elevacao-lateral-halteres',
    nome: 'Elevação lateral com halteres',
    descricao:
      'Em pé, halteres ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros, cotovelos levemente flexionados, sem balançar o tronco. Desça controlando o peso até a posição inicial.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/DsgkuIt.gif',
  },
  {
    id: 'supino-reto-barra',
    nome: 'Supino reto com barra',
    descricao:
      'Deitado no banco reto, pegada na barra um pouco mais larga que os ombros. Desça a barra controlada até tocar o meio do peito, cotovelos a cerca de 45 graus do tronco, e empurre de volta estendendo os braços sem travar os cotovelos.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',
  },
  {
    id: 'supino-declinado-barra',
    nome: 'Supino declinado com barra',
    descricao:
      'Deitado no banco declinado, pés presos na extremidade alta. Desça a barra até a parte inferior do peito e empurre de volta, mantendo os ombros estáveis contra o banco durante todo o movimento.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/GrO65fd.gif',
  },
  {
    id: 'supino-inclinado-halteres',
    nome: 'Supino inclinado com halteres',
    descricao:
      'Deitado no banco inclinado (30-45 graus), halteres na altura do peito com as palmas voltadas pra frente. Empurre os halteres para cima até quase encostar um no outro, e desça controlado até sentir alongamento no peito.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/B3Rxp6L.gif',
  },
  {
    id: 'supino-declinado-halteres',
    nome: 'Supino declinado com halteres',
    descricao:
      'Deitado no banco declinado, halteres na altura do peito. Empurre para cima controlando o percurso, focando a contração na parte inferior do peitoral, e desça devagar até o alongamento confortável.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/DwhEmmE.gif',
  },
  {
    id: 'supino-inclinado-smith',
    nome: 'Supino inclinado na smith machine',
    descricao:
      'Banco inclinado posicionado sob a barra guiada da smith machine. Destrave a barra, desça até a parte superior do peito e empurre de volta — a trajetória fixa ajuda a manter a forma durante o movimento.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Smith Machine',
    animacaoUrl: 'https://static.exercisedb.dev/media/5v7KYld.gif',
  },
  {
    id: 'supino-maquina',
    nome: 'Supino na máquina',
    descricao:
      'Sentado na máquina de supino, costas apoiadas no encosto, mãos nas alças na altura do peito. Empurre para frente estendendo os braços e retorne controlado sem deixar o peso bater nos pinos.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/DOoWcnA.gif',
  },
  {
    id: 'supino-cabo',
    nome: 'Supino no cabo',
    descricao:
      'De pé ou sentado entre as polias ajustadas na altura do peito, empurre as alças para frente estendendo os braços, cruzando levemente ao final para maximizar a contração do peitoral.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/7xI5MXA.gif',
  },
  {
    id: 'crucifixo-inclinado-halteres',
    nome: 'Crucifixo inclinado com halteres',
    descricao:
      'Deitado no banco inclinado, halteres acima do peito com cotovelos levemente flexionados. Abra os braços em arco até sentir alongamento no peitoral e retorne pelo mesmo caminho, sem flexionar mais os cotovelos no trajeto.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/ESOd5Pl.gif',
  },
  {
    id: 'crucifixo-inclinado-cabo',
    nome: 'Crucifixo no cabo (cable crossover)',
    descricao:
      'De pé entre duas torres de polia alta, um cabo em cada mão. Puxe os cabos num arco à frente do corpo até se encontrarem na altura do peito, contraindo o peitoral, e retorne controlado.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/0CXGHya.gif',
  },
  {
    id: 'crucifixo-baixo-cabo',
    nome: 'Crucifixo baixo no cabo (cross-over)',
    descricao:
      'De pé entre as torres com as polias na posição baixa, puxe as alças num arco ascendente até se encontrarem na frente do corpo, focando a contração na parte superior do peitoral.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/FVmZVhk.gif',
  },
  {
    id: 'crucifixo-declinado-cabo',
    nome: 'Crucifixo declinado no cabo',
    descricao:
      'Com as polias na posição alta, incline levemente o tronco pra frente e puxe as alças num arco descendente até as mãos se encontrarem, focando a parte inferior do peitoral.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/7saC5zz.gif',
  },
  {
    id: 'mergulho-paralelas-peito',
    nome: 'Mergulho nas paralelas (foco peito)',
    descricao:
      'Apoiado nas paralelas com os braços estendidos, incline o tronco levemente pra frente e desça flexionando os cotovelos até sentir alongamento no peito, depois empurre de volta à posição inicial.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'avancado',
    equipamento: 'Paralelas',
    animacaoUrl: 'https://static.exercisedb.dev/media/9WTm7dq.gif',
  },
  {
    id: 'mergulho-pegada-aberta-paralelas',
    nome: 'Mergulho pegada aberta nas paralelas',
    descricao:
      'Nas paralelas com pegada mais aberta que a largura dos ombros, desça o corpo controlado flexionando os cotovelos para os lados, enfatizando o peitoral, e empurre de volta estendendo os braços.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'avancado',
    equipamento: 'Paralelas',
    animacaoUrl: 'https://static.exercisedb.dev/media/O2K9Vb5.gif',
  },
  {
    id: 'flexao-inclinada',
    nome: 'Flexão inclinada',
    descricao:
      'Mãos apoiadas numa superfície elevada (banco ou step), corpo em linha reta da cabeça aos pés. Desça o peito em direção à superfície flexionando os cotovelos e empurre de volta — versão mais acessível da flexão tradicional.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/B1EVP9F.gif',
  },
  {
    id: 'flexao-arqueiro',
    nome: 'Flexão arqueiro',
    descricao:
      'Na posição de flexão com as mãos bem afastadas, desça o corpo transferindo o peso para um lado enquanto o braço oposto fica estendido ao lado, depois troque de lado — exige mais força e estabilidade que a flexão tradicional.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'avancado',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/A9qxk2F.gif',
  },
  {
    id: 'supino-inclinado-pegada-invertida-barra',
    nome: 'Supino inclinado pegada invertida com barra',
    descricao:
      'No banco inclinado, segure a barra com as palmas voltadas para o próprio rosto (pegada supinada). Desça controlado até a parte superior do peito e empurre de volta — a pegada invertida muda a ênfase sobre o peitoral superior.',
    grupoMuscular: 'peito',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/DU7I633.gif',
  },
  {
    id: 'puxada-frente-barra-reta',
    nome: 'Puxada frontal pegada paralela',
    descricao:
      'Sentado no aparelho de puxada, segurando as duas alças paralelas (pegada neutra). Puxe até a altura do peito contraindo as costas, e retorne controlado até o braço estender por completo.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/rkg41Fb.gif',
  },
  {
    id: 'barra-fixa-pegada-neutra',
    nome: 'Barra fixa pegada neutra',
    descricao:
      'Pendurado na barra com as palmas voltadas uma para a outra. Puxe o corpo para cima até o queixo passar da barra, contraindo as costas, e desça controlado até os braços estenderem.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'avancado',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/0V2YQjW.gif',
  },
  {
    id: 'remada-invertida',
    nome: 'Remada invertida',
    descricao:
      'Deitado sob uma barra fixa numa altura baixa, segure-a com os braços estendidos e o corpo reto. Puxe o peito em direção à barra contraindo as costas, e desça controlado até os braços estenderem.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/bZGHsAZ.gif',
  },
  {
    id: 'barra-fixa-assistida-maquina',
    nome: 'Barra fixa assistida (máquina)',
    descricao:
      'Apoiado na plataforma ou joelhos da máquina assistida, que reduz o peso corporal a puxar. Puxe o corpo para cima até o queixo passar da barra e desça controlado, mantendo a técnica da barra fixa tradicional.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/kiJ4Z2K.gif',
  },
  {
    id: 'remada-curvada-smith',
    nome: 'Remada curvada com barra',
    descricao:
      'Tronco inclinado à frente, joelhos levemente flexionados, barra pendendo com os braços estendidos. Puxe a barra em direção ao abdômen contraindo as costas, e desça controlado até os braços estenderem.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/eZyBC3j.gif',
  },
  {
    id: 'remada-sentada-maquina',
    nome: 'Remada sentada na máquina',
    descricao:
      'Sentado na máquina com o peito apoiado, segure as alças e puxe em direção ao tronco contraindo as costas e aproximando as escápulas, depois retorne controlado.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/7I6LNUG.gif',
  },
  {
    id: 'remada-sentada-cabo',
    nome: 'Remada sentada no cabo',
    descricao:
      'Sentado de frente para a polia baixa, pés apoiados na plataforma e joelhos levemente flexionados. Puxe a alça em direção ao abdômen mantendo o tronco ereto, e retorne controlado estendendo os braços.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/fUBheHs.gif',
  },
  {
    id: 'remada-curvada-halter',
    nome: 'Remada curvada com halteres',
    descricao:
      'Tronco inclinado à frente, joelhos levemente flexionados, halteres pendendo com os braços estendidos. Puxe os halteres em direção à cintura contraindo as costas, e desça controlado.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/BJ0Hz5L.gif',
  },
  {
    id: 'remada-unilateral-halter',
    nome: 'Remada unilateral com halter',
    descricao:
      'Um joelho e uma mão apoiados no banco, tronco paralelo ao chão. Puxe o halter com o outro braço em direção à cintura contraindo as costas, e desça controlado até o braço estender.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/C0MA9bC.gif',
  },
  {
    id: 'remada-cavalinho-maquina',
    nome: 'Remada cavalinho na máquina',
    descricao:
      'Apoiado no suporte da máquina com o peito firme, segure as alças em V e puxe em direção ao tronco contraindo as costas, retornando controlado até o braço estender.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/aaXr7ld.gif',
  },
  {
    id: 'puxada-triangulo-cabo',
    nome: 'Puxada triângulo no cabo',
    descricao:
      'Sentado no aparelho de puxada com a pegada triângulo (pegada neutra, mãos próximas). Puxe até a altura do peito contraindo as costas, e retorne controlado até o braço estender por completo.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/4c9BhzB.gif',
  },
  {
    id: 'puxada-pegada-invertida-maquina',
    nome: 'Puxada pegada invertida na máquina',
    descricao:
      'Sentado na máquina de puxada com pegada supinada (palmas voltadas para você). Puxe a barra até a altura do peito contraindo as costas e o bíceps, e retorne controlado.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/ecpY0rH.gif',
  },
  {
    id: 'remada-renegade-kettlebell',
    nome: 'Remada renegade com kettlebell',
    descricao:
      'Na posição de prancha com uma mão em cada kettlebell. Puxe um kettlebell em direção à cintura mantendo o quadril estável, desça e repita do outro lado — exige bastante estabilidade do core.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'avancado',
    equipamento: 'Kettlebell',
    animacaoUrl: 'https://static.exercisedb.dev/media/b9kqlBy.gif',
  },
  {
    id: 'remada-alternada-kettlebell',
    nome: 'Remada alternada com kettlebell',
    descricao:
      'Tronco inclinado à frente, um kettlebell em cada mão. Puxe um kettlebell em direção à cintura enquanto o outro permanece estendido, alternando o movimento entre os lados.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Kettlebell',
    animacaoUrl: 'https://static.exercisedb.dev/media/Ca76jUE.gif',
  },
  {
    id: 'puxada-frontal-maquina',
    nome: 'Puxada frontal na máquina',
    descricao:
      'Sentado na máquina com as coxas presas sob o apoio, segure as alças e puxe para baixo em direção ao peito contraindo as costas, retornando controlado até o braço estender.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/7F1DVzn.gif',
  },
  {
    id: 'remada-rotacional-cabo',
    nome: 'Remada em pé no cabo (v-bar)',
    descricao:
      'De pé de frente para a polia baixa, segurando a alça em V. Puxe em direção à cintura contraindo as costas, mantendo o tronco ereto, e retorne controlado.',
    grupoMuscular: 'costas',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/4f8RXP8.gif',
  },
  {
    id: 'remada-alta-barra',
    nome: 'Remada alta com barra',
    descricao:
      'Em pé, segure a barra com pegada pronada na frente das coxas. Puxe a barra para cima rente ao corpo até a altura do peito, cotovelos acima dos pulsos, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/83HoW9X.gif',
  },
  {
    id: 'desenvolvimento-unilateral-halter',
    nome: 'Desenvolvimento unilateral com halter',
    descricao:
      'Sentado ou em pé, halter na altura do ombro com um braço. Empurre para cima estendendo o braço completamente e desça controlado até o halter voltar à altura do ombro.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/1TkiAFK.gif',
  },
  {
    id: 'desenvolvimento-maquina',
    nome: 'Desenvolvimento na máquina',
    descricao:
      'Sentado na máquina com as costas apoiadas, segure as alças na altura dos ombros. Empurre para cima estendendo os braços e desça controlado até o ponto inicial.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/67n3r98.gif',
  },
  {
    id: 'elevacao-frontal-halteres',
    nome: 'Elevação frontal com halteres',
    descricao:
      'Em pé, halteres à frente das coxas. Eleve um ou os dois halteres à frente do corpo até a altura dos ombros, cotovelos levemente flexionados, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/3eGE2JC.gif',
  },
  {
    id: 'desenvolvimento-em-pe-halteres',
    nome: 'Desenvolvimento em pé com halteres',
    descricao:
      'Em pé, halteres na altura dos ombros com as palmas voltadas pra frente. Empurre os halteres para cima até quase se encontrarem, mantendo o core firme, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/A6wtbuL.gif',
  },
  {
    id: 'arnold-press-halteres',
    nome: 'Arnold press com halteres',
    descricao:
      'Sentado, halteres na frente dos ombros com as palmas voltadas para você. Ao empurrar para cima, rotacione os punhos até as palmas ficarem para frente no topo, e reverta o movimento na descida.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'avancado',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/eOrFCnx.gif',
  },
  {
    id: 'desenvolvimento-sentado-barra',
    nome: 'Desenvolvimento sentado com barra',
    descricao:
      'Sentado com as costas apoiadas, barra na altura dos ombros com pegada um pouco mais larga que eles. Empurre a barra para cima estendendo os braços e desça controlado até a altura dos ombros.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/kTbSH9h.gif',
  },
  {
    id: 'desenvolvimento-smith',
    nome: 'Desenvolvimento na smith machine',
    descricao:
      'Sentado sob a barra guiada, na altura dos ombros. Destrave a barra, empurre para cima estendendo os braços e desça controlado — a trajetória fixa ajuda a manter a forma.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'iniciante',
    equipamento: 'Smith Machine',
    animacaoUrl: 'https://static.exercisedb.dev/media/903mzG8.gif',
  },
  {
    id: 'elevacao-lateral-cabo',
    nome: 'Elevação lateral no cabo',
    descricao:
      'De lado para a polia baixa, segure a alça com o braço mais próximo da polia. Eleve o braço lateralmente até a altura do ombro mantendo o cotovelo levemente flexionado, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/goJ6ezq.gif',
  },
  {
    id: 'elevacao-frontal-barra',
    nome: 'Elevação frontal com barra',
    descricao:
      'Em pé, barra na frente das coxas com pegada pronada. Eleve a barra à frente do corpo até a altura dos ombros mantendo os braços quase estendidos, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/b2Uoz54.gif',
  },
  {
    id: 'elevacao-lateral-maquina',
    nome: 'Elevação lateral na máquina',
    descricao:
      'Sentado na máquina com os braços apoiados nas almofadas laterais. Eleve os braços lateralmente até a altura dos ombros contraindo o deltoide, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/dRTfGZT.gif',
  },
  {
    id: 'remada-alta-halteres',
    nome: 'Remada alta com halteres',
    descricao:
      'Em pé, halteres na frente das coxas. Puxe os halteres para cima rente ao corpo até a altura do peito, cotovelos acima dos pulsos, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/ainizkb.gif',
  },
  {
    id: 'desenvolvimento-unilateral-kettlebell',
    nome: 'Desenvolvimento unilateral com kettlebell',
    descricao:
      'Kettlebell apoiado na posição de rack junto ao ombro. Empurre para cima estendendo o braço completamente, mantendo o core firme pra equilibrar a carga assimétrica, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'avancado',
    equipamento: 'Kettlebell',
    animacaoUrl: 'https://static.exercisedb.dev/media/kuXhl0o.gif',
  },
  {
    id: 'elevacao-posterior-deitado-halteres',
    nome: 'Elevação posterior deitado com halteres',
    descricao:
      'Deitado de bruços num banco inclinado, halteres pendendo com os braços estendidos. Eleve os braços lateralmente contraindo a parte posterior do ombro, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/53Ttlck.gif',
  },
  {
    id: 'remada-alta-cabo',
    nome: 'Remada alta no cabo',
    descricao:
      'De pé de frente para a polia baixa, segure a barra ou alça. Puxe para cima rente ao corpo até a altura do peito, cotovelos acima dos pulsos, e desça controlado.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/cALKspW.gif',
  },
  {
    id: 'desenvolvimento-unilateral-maquina',
    nome: 'Desenvolvimento unilateral na máquina',
    descricao:
      'Sentado na máquina, segure uma alça na altura do ombro. Empurre para cima estendendo o braço e desça controlado — útil pra corrigir desequilíbrio entre os dois lados.',
    grupoMuscular: 'ombro',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/2KGnL6M.gif',
  },
  {
    id: 'rosca-direta-barra',
    nome: 'Rosca direta com barra',
    descricao:
      'Em pé, barra com pegada supinada na largura dos ombros. Flexione os cotovelos elevando a barra até a altura do peito, sem balançar o tronco, e desça controlado até o braço estender.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/25GPyDY.gif',
  },
  {
    id: 'rosca-martelo-halteres',
    nome: 'Rosca martelo com halteres',
    descricao:
      'Em pé, halteres ao lado do corpo com pegada neutra (palmas voltadas uma pra outra). Flexione os cotovelos elevando os halteres até a altura do ombro, e desça controlado.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/2NpxjC1.gif',
  },
  {
    id: 'rosca-direta-halteres',
    nome: 'Rosca direta com halteres',
    descricao:
      'Em pé, halteres ao lado do corpo com as palmas voltadas pra frente. Flexione os cotovelos elevando os halteres até a altura do ombro, e desça controlado até o braço estender.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/3s4NnTh.gif',
  },
  {
    id: 'rosca-pegada-fechada-barra',
    nome: 'Rosca pegada fechada com barra',
    descricao:
      'Em pé, barra com pegada supinada mais estreita que a largura dos ombros. Flexione os cotovelos elevando a barra, sentindo maior ênfase na porção interna do bíceps, e desça controlado.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/4dUn2iv.gif',
  },
  {
    id: 'rosca-inversa-banco-scott',
    nome: 'Rosca inversa no banco scott',
    descricao:
      'Braços apoiados no banco scott, pegada pronada na barra. Flexione os cotovelos elevando a barra, trabalhando antebraço e a porção externa do bíceps, e desça controlado.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/4LIG9xr.gif',
  },
  {
    id: 'triceps-testa-barra',
    nome: 'Tríceps testa com barra',
    descricao:
      'Deitado no banco, barra acima do peito com os braços estendidos. Flexione só os cotovelos descendo a barra em direção à testa, e estenda de volta contraindo o tríceps.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/iZop9xO.gif',
  },
  {
    id: 'triceps-frances-cabo',
    nome: 'Tríceps francês no cabo',
    descricao:
      'De costas para a polia alta, segure a corda acima da cabeça com os cotovelos próximos às orelhas. Estenda os braços para cima contraindo o tríceps, e flexione controlado de volta.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/1xHyxys.gif',
  },
  {
    id: 'triceps-overhead-corda',
    nome: 'Tríceps overhead na corda',
    descricao:
      'De costas para a polia baixa, corda acima da cabeça com os cotovelos fixos. Estenda os braços para cima contraindo o tríceps, e flexione controlado de volta à posição inicial.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/2IxROQ1.gif',
  },
  {
    id: 'triceps-pulley',
    nome: 'Tríceps pulley (polia alta)',
    descricao:
      'De frente para a polia alta, cotovelos fixos ao lado do corpo. Estenda os braços para baixo contraindo o tríceps, e retorne controlado até os cotovelos chegarem a 90 graus.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/3ZflifB.gif',
  },
  {
    id: 'triceps-mergulho-chao',
    nome: 'Tríceps mergulho no chão (banco)',
    descricao:
      'Mãos apoiadas na borda de um banco atrás do corpo, pernas estendidas à frente. Desça o corpo flexionando os cotovelos e empurre de volta estendendo os braços, focando o tríceps.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/7aVz15j.gif',
  },
  {
    id: 'triceps-frances-sentado-barra',
    nome: 'Tríceps francês sentado com barra',
    descricao:
      'Sentado, barra acima da cabeça com os braços estendidos. Flexione os cotovelos descendo a barra atrás da cabeça, e estenda de volta contraindo o tríceps.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/5uFK1xr.gif',
  },
  {
    id: 'rosca-martelo-alternada-sentado',
    nome: 'Rosca martelo alternada sentado',
    descricao:
      'Sentado, halteres ao lado do corpo com pegada neutra. Flexione um braço de cada vez elevando o halter até a altura do ombro, alternando entre os lados.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/6em2Dxj.gif',
  },
  {
    id: 'rosca-scott-unilateral-cabo',
    nome: 'Rosca scott unilateral no cabo',
    descricao:
      'Braço apoiado no banco scott, segurando a alça da polia baixa. Flexione o cotovelo elevando a alça até a altura do ombro, e desça controlado até o braço estender.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/4hATdoB.gif',
  },
  {
    id: 'rosca-inversa-halteres',
    nome: 'Rosca inversa com halteres',
    descricao:
      'Em pé, halteres com pegada pronada (palmas voltadas para baixo). Flexione os cotovelos elevando os halteres, trabalhando antebraço e a porção externa do bíceps.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/0IgNjSM.gif',
  },
  {
    id: 'rosca-concentrada-sentada-barra',
    nome: 'Rosca concentrada sentada (pegada fechada) com barra',
    descricao:
      'Sentado, cotovelos apoiados na parte interna das coxas, barra com pegada fechada. Flexione os cotovelos elevando a barra bem devagar, isolando o bíceps, e desça controlado.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/1V1gj1u.gif',
  },
  {
    id: 'rosca-martelo-unilateral-em-pe',
    nome: 'Rosca martelo unilateral em pé',
    descricao:
      'Em pé, halter com pegada neutra em uma mão. Flexione o cotovelo elevando o halter até a altura do ombro, mantendo o tronco parado, e desça controlado.',
    grupoMuscular: 'braco',
    nivelDificuldade: 'iniciante',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/2sQGZ5b.gif',
  },
  {
    id: 'abdominal-supra',
    nome: 'Abdominal supra (sit-up)',
    descricao:
      'Deitado de costas, joelhos flexionados e pés apoiados no chão. Suba o tronco até ficar sentado contraindo o abdômen, e desça controlado de volta ao chão.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/Bn6TXyO.gif',
  },
  {
    id: 'abdominal-bicicleta',
    nome: 'Abdominal bicicleta',
    descricao:
      'Deitado de costas, mãos atrás da cabeça e pernas elevadas. Leve o cotovelo em direção ao joelho oposto enquanto estende a outra perna, alternando o movimento como se pedalasse.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/1ZFqTDN.gif',
  },
  {
    id: 'elevacao-pernas-barra',
    nome: 'Elevação de pernas na barra',
    descricao:
      'Pendurado na barra fixa com os braços estendidos. Eleve as pernas flexionadas em direção ao peito contraindo o abdômen, e desça controlado sem balançar o corpo.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra fixa',
    animacaoUrl: 'https://static.exercisedb.dev/media/I3tsCnC.gif',
  },
  {
    id: 'elevacao-pernas-retas-barra',
    nome: 'Elevação de pernas retas na barra',
    descricao:
      'Pendurado na barra fixa, pernas estendidas. Eleve as pernas retas até a altura do quadril contraindo o abdômen, e desça controlado sem usar embalo.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra fixa',
    animacaoUrl: 'https://static.exercisedb.dev/media/4Ml7QFO.gif',
  },
  {
    id: 'abdominal-obliquo',
    nome: 'Abdominal oblíquo',
    descricao:
      'Deitado de costas, joelhos flexionados para um lado. Suba o tronco em direção aos joelhos contraindo o oblíquo, e desça controlado — repita do outro lado.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/cJgSTmh.gif',
  },
  {
    id: 'prancha-frontal-rotacao',
    nome: 'Prancha frontal com rotação',
    descricao:
      'Na posição de prancha com os antebraços apoiados. Gire o quadril para um lado quase tocando o chão, volte ao centro e repita para o outro lado, mantendo o abdômen contraído.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/CosupLu.gif',
  },
  {
    id: 'prancha-ajoelhada-toque-ombro',
    nome: 'Prancha ajoelhada com toque no ombro',
    descricao:
      'Na posição de prancha apoiada nos joelhos, mãos no chão. Toque o ombro oposto com uma mão de cada vez, mantendo o quadril o mais estável possível — boa progressão antes da prancha completa.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/h1ezqSu.gif',
  },
  {
    id: 'elevacao-pernas-sentado',
    nome: 'Elevação de pernas sentado',
    descricao:
      'Sentado na borda do banco, mãos apoiadas ao lado do corpo. Eleve as pernas flexionadas em direção ao peito contraindo o abdômen, e desça controlado sem tocar o chão.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/Hgs6Nl1.gif',
  },
  {
    id: 'abdominal-bracos-estendidos',
    nome: 'Abdominal com braços estendidos',
    descricao:
      'Deitado de costas, braços estendidos acima da cabeça. Suba o tronco levando os braços à frente até sentar, contraindo o abdômen, e desça controlado.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/kjJ3VoQ.gif',
  },
  {
    id: 'abdominal-declinado',
    nome: 'Abdominal declinado',
    descricao:
      'Deitado no banco declinado, pés presos na parte alta. Suba o tronco contraindo o abdômen até quase sentar, e desça controlado sem deixar a lombar bater no banco.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/9Ap7miY.gif',
  },
  {
    id: 'abdominal-sentado-cabo',
    nome: 'Abdominal sentado no cabo',
    descricao:
      'Sentado de frente para a polia alta, segurando a corda atrás da cabeça. Flexione o tronco para frente contraindo o abdômen, e retorne controlado até a posição inicial.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Polia',
    animacaoUrl: 'https://static.exercisedb.dev/media/8xUv4J7.gif',
  },
  {
    id: 'abdominal-maquina',
    nome: 'Abdominal na máquina',
    descricao:
      'Sentado na máquina com o peito apoiado nas almofadas. Flexione o tronco para frente contraindo o abdômen contra a resistência, e retorne controlado.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/eXFXCY0.gif',
  },
  {
    id: 'russian-twist-cabo-bola',
    nome: 'Russian twist no cabo (com bola suíça)',
    descricao:
      'Sentado numa bola suíça de frente para a polia baixa, segurando a alça com as duas mãos. Gire o tronco de um lado para o outro contraindo o oblíquo, mantendo o quadril estável.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'avancado',
    equipamento: 'Polia + Bola suíça',
    animacaoUrl: 'https://static.exercisedb.dev/media/d9Xaxq6.gif',
  },
  {
    id: 'elevacao-alternada-pernas-sentado-barra',
    nome: 'Elevação alternada de pernas sentado com barra',
    descricao:
      'Sentado na borda do banco segurando a barra apoiada nas coxas como lastro. Eleve uma perna de cada vez contraindo o abdômen inferior, alternando entre os lados.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/BCs0G2F.gif',
  },
  {
    id: 'elevacao-pernas-rotacao',
    nome: 'Elevação de pernas com rotação',
    descricao:
      'Deitado de costas, pernas estendidas para cima. Gire as pernas unidas de um lado para o outro próximo ao chão, contraindo o abdômen pra controlar o movimento.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'avancado',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/C0eCeEt.gif',
  },
  {
    id: 'abdominal-supra-joelhos-flexionados',
    nome: 'Abdominal supra com joelhos flexionados',
    descricao:
      'Deitado de costas, joelhos bem flexionados e pés próximos ao glúteo. Suba o tronco contraindo o abdômen até quase sentar, e desça controlado de volta.',
    grupoMuscular: 'abdomen',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/AR0ig3o.gif',
  },
  {
    id: 'agachamento-hack-barra',
    nome: 'Agachamento hack com barra',
    descricao:
      'Barra segurada atrás do corpo, pés na largura dos ombros. Agache mantendo o tronco ereto e a barra próxima às pernas, até as coxas ficarem paralelas ao chão, e suba controlado.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/5VCj6iH.gif',
  },
  {
    id: 'leg-press-horizontal-unilateral',
    nome: 'Leg press horizontal unilateral na máquina',
    descricao:
      'Sentado na máquina de leg press horizontal, um pé apoiado na plataforma. Empurre a plataforma estendendo a perna, e flexione controlado de volta sem travar o joelho.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/9KU9TYF.gif',
  },
  {
    id: 'mesa-flexora-deitado',
    nome: 'Mesa flexora (cadeira flexora deitado)',
    descricao:
      'Deitado de bruços na máquina, tornozelos sob a almofada. Flexione os joelhos levando a almofada em direção ao glúteo, e desça controlado até as pernas estenderem.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/17lJ1kr.gif',
  },
  {
    id: 'flexora-em-pe-unilateral',
    nome: 'Flexora em pé unilateral',
    descricao:
      'Em pé, apoiado na máquina com uma perna na almofada. Flexione o joelho levando a almofada em direção ao glúteo, e desça controlado até a perna estender.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/C5jncD2.gif',
  },
  {
    id: 'agachamento-frontal-kettlebell',
    nome: 'Agachamento frontal com kettlebell',
    descricao:
      'Kettlebell segurado na posição de rack junto ao peito. Agache mantendo o tronco ereto até as coxas ficarem paralelas ao chão, e suba controlado.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Kettlebell',
    animacaoUrl: 'https://static.exercisedb.dev/media/DB0n8AG.gif',
  },
  {
    id: 'agachamento-bulgaro',
    nome: 'Agachamento búlgaro (split squat)',
    descricao:
      'Um pé apoiado atrás num banco, o outro à frente no chão. Desça flexionando o joelho da frente até quase tocar o chão com o joelho de trás, e suba controlado — exige bastante equilíbrio.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/9E25EOx.gif',
  },
  {
    id: 'afundo-step-halteres',
    nome: 'Afundo com subida no step e halteres',
    descricao:
      'Halteres ao lado do corpo, um pé apoiado num step à frente. Suba o corpo empurrando pelo pé de cima até ficar em pé sobre o step, e desça controlado de volta.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/gFyFj9z.gif',
  },
  {
    id: 'afundo-reverso-barra',
    nome: 'Afundo reverso com barra',
    descricao:
      'Barra apoiada na parte superior das costas. Dê um passo para trás flexionando ambos os joelhos até o de trás quase tocar o chão, e volte à posição inicial empurrando pelo pé da frente.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/62Nw60O.gif',
  },
  {
    id: 'agachamento-unilateral-assistido',
    nome: 'Agachamento unilateral assistido',
    descricao:
      'Em pé numa perna só, segurando um apoio para equilíbrio. Agache nessa perna o quanto conseguir controlar, mantendo a outra perna estendida à frente, e suba controlado.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/C31LMnP.gif',
  },
  {
    id: 'panturrilha-sentado-maquina',
    nome: 'Panturrilha sentado na máquina',
    descricao:
      'Sentado na máquina, joelhos sob a almofada e ponta dos pés na plataforma. Eleve os calcanhares contraindo a panturrilha, e desça controlado até sentir o alongamento.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'iniciante',
    equipamento: 'Máquina',
    animacaoUrl: 'https://static.exercisedb.dev/media/bOOdeyc.gif',
  },
  {
    id: 'panturrilha-em-pe-barra',
    nome: 'Panturrilha em pé com barra',
    descricao:
      'Barra apoiada na parte superior das costas, ponta dos pés numa plataforma elevada. Eleve os calcanhares contraindo a panturrilha, e desça controlado até o alongamento.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'iniciante',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/8ozhUIZ.gif',
  },
  {
    id: 'panturrilha-unilateral-halter',
    nome: 'Panturrilha unilateral com halter',
    descricao:
      'Em pé numa perna, ponta do pé numa superfície elevada, halter na mão do mesmo lado. Eleve o calcanhar contraindo a panturrilha, e desça controlado até o alongamento.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'intermediario',
    equipamento: 'Halteres',
    animacaoUrl: 'https://static.exercisedb.dev/media/1kB3Wmk.gif',
  },
  {
    id: 'elevacao-quadril-banco',
    nome: 'Elevação de quadril (ponte) no banco',
    descricao:
      'Costas superiores apoiadas num banco, pés no chão na largura do quadril. Eleve o quadril contraindo o glúteo até o tronco ficar alinhado com as coxas, e desça controlado.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'iniciante',
    equipamento: 'Peso corporal',
    animacaoUrl: 'https://static.exercisedb.dev/media/aWedzZX.gif',
  },
  {
    id: 'agachamento-profundo-barra',
    nome: 'Agachamento profundo com barra',
    descricao:
      'Barra apoiada na parte superior das costas, pés na largura dos ombros. Agache o mais fundo que a mobilidade permitir mantendo o tronco ereto, e suba controlado.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/DhMl549.gif',
  },
  {
    id: 'agachamento-pistol-kettlebell',
    nome: 'Agachamento pistol com kettlebell',
    descricao:
      'Em pé numa perna, kettlebell segurado à frente do peito para contrabalancear. Agache nessa perna até o máximo que conseguir controlar, mantendo a outra estendida à frente.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Kettlebell',
    animacaoUrl: 'https://static.exercisedb.dev/media/5bpPTHv.gif',
  },
  {
    id: 'agachamento-barra-baixa',
    nome: 'Agachamento barra baixa (powerlifting)',
    descricao:
      'Barra posicionada mais baixa nas costas, sobre os deltoides posteriores, tronco mais inclinado à frente. Agache até as coxas ficarem paralelas ou abaixo, e suba controlado — estilo usado em powerlifting.',
    grupoMuscular: 'perna',
    nivelDificuldade: 'avancado',
    equipamento: 'Barra',
    animacaoUrl: 'https://static.exercisedb.dev/media/bTpEUcm.gif',
  },
]

export const seedMetas: Meta[] = [
  {
    id: 'goal-1',
    alunoId: 'sub-1',
    profissionalId: 'prof-2',
    description: 'Reduzir percentual de gordura',
    type: 'measurement',
    targetValue: 18,
    deadline: '2026-12-31',
    status: 'inProgress',
  },
]

export const seedAvaliacoesFisicas: AvaliacaoFisica[] = [
  {
    id: 'assessment-1',
    alunoId: 'sub-1',
    objective: 'Emagrecimento',
    description: 'Avaliacao inicial',
    notes: '',
    assessmentDate: '2026-10-01',
    weight: 82,
    measurements: { peito: 100, braco: 35, cintura: 88 },
  },
  {
    id: 'assessment-2',
    alunoId: 'sub-2',
    objective: 'Condicionamento',
    description: 'Avaliacao inicial',
    notes: '',
    assessmentDate: '2026-10-05',
    weight: 65,
    measurements: { peito: 88, braco: 26, cintura: 68 },
  },
]

export const seedUsuarios: Usuario[] = [
  { id: 'user-admin', nome: 'Camila Duarte', email: 'admin@biggym.com', password: 'admin123', role: 'admin', refId: 'gym-1' },
  { id: 'user-atendente', nome: 'Paula Rocha', email: 'atendente@biggym.com', password: 'atendente123', role: 'atendente', refId: 'attendant-1' },
  { id: 'user-prof', nome: 'Carla Mendes', email: 'profissional@biggym.com', password: 'prof123', role: 'professional', refId: 'prof-1' },
  { id: 'user-sub', nome: 'Joao Pereira', email: 'aluno@biggym.com', password: 'aluno123', role: 'subscriber', refId: 'sub-1' },
]

export const seedCheckins: CheckIn[] = []
