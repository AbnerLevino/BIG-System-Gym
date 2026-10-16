// Dados de exemplo que populam o sistema na primeira vez que alguém abre o app
// (consumidos por ensureSeeded nos *Repository.ts). Sem isso o app abriria vazio.
import type {
  Usuario,
  Academia,
  Profissional,
  Aluno,
  Plano,
  Pagamento,
  Atendimento,
  Treino,
  Meta,
  AvaliacaoFisica,
} from '../types'

export const seedAcademias: Academia[] = [
  { id: 'gym-1', name: 'BigGym Centro', address: 'Rua das Academias, 100', phone: '(11) 4000-0000' },
]

export const seedPlanos: Plano[] = [
  { id: 'plan-1', name: 'Mensal Basico', price: 99.9, modalities: ['Musculacao'], conditions: 'Sem fidelidade' },
  { id: 'plan-2', name: 'Trimestral Plus', price: 259.9, modalities: ['Musculacao', 'Funcional'], conditions: '3 meses, 10% de desconto' },
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
  { id: 'user-admin', email: 'admin@biggym.com', password: 'admin123', role: 'admin', refId: 'gym-1' },
  { id: 'user-prof', email: 'profissional@biggym.com', password: 'prof123', role: 'professional', refId: 'prof-1' },
  { id: 'user-sub', email: 'aluno@biggym.com', password: 'aluno123', role: 'subscriber', refId: 'sub-1' },
]
