// Dados de exemplo que populam o sistema na primeira vez que alguém abre o app
// (consumidos por ensureSeeded nos *Repository.ts). Sem isso o app abriria vazio.
import type {
  User,
  Gym,
  Professional,
  Subscriber,
  Plan,
  Payment,
  Assignment,
  Workout,
  Goal,
  PhysicalAssessment,
} from '../types'

export const seedGyms: Gym[] = [
  { id: 'gym-1', name: 'BigGym Centro', address: 'Rua das Academias, 100', phone: '(11) 4000-0000' },
]

export const seedPlans: Plan[] = [
  { id: 'plan-1', name: 'Mensal Basico', price: 99.9, modalities: ['Musculacao'], conditions: 'Sem fidelidade' },
  { id: 'plan-2', name: 'Trimestral Plus', price: 259.9, modalities: ['Musculacao', 'Funcional'], conditions: '3 meses, 10% de desconto' },
]

export const seedProfessionals: Professional[] = [
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

export const seedSubscribers: Subscriber[] = [
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
    currentPlanId: 'plan-1',
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
    currentPlanId: 'plan-2',
    startDate: '2026-02-01',
  },
]

export const seedPayments: Payment[] = [
  {
    id: 'pay-1',
    gymId: 'gym-1',
    subscriberId: 'sub-1',
    planId: 'plan-1',
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
    gymId: 'gym-1',
    subscriberId: 'sub-2',
    planId: 'plan-2',
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

export const seedAssignments: Assignment[] = [
  { id: 'assign-1', subscriberId: 'sub-1', professionalId: 'prof-1', type: 'standard' },
  { id: 'assign-2', subscriberId: 'sub-2', professionalId: 'prof-1', type: 'standard' },
  { id: 'assign-3', subscriberId: 'sub-1', professionalId: 'prof-2', type: 'personal', value: 150 },
]

export const seedWorkouts: Workout[] = [
  {
    id: 'workout-1',
    subscriberId: 'sub-1',
    assignmentId: 'assign-1',
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
    subscriberId: 'sub-2',
    assignmentId: 'assign-2',
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

export const seedGoals: Goal[] = [
  {
    id: 'goal-1',
    subscriberId: 'sub-1',
    professionalId: 'prof-2',
    description: 'Reduzir percentual de gordura',
    type: 'measurement',
    targetValue: 18,
    deadline: '2026-12-31',
    status: 'inProgress',
  },
]

export const seedPhysicalAssessments: PhysicalAssessment[] = [
  {
    id: 'assessment-1',
    subscriberId: 'sub-1',
    objective: 'Emagrecimento',
    description: 'Avaliacao inicial',
    notes: '',
    assessmentDate: '2026-10-01',
    weight: 82,
    measurements: { peito: 100, braco: 35, cintura: 88 },
  },
  {
    id: 'assessment-2',
    subscriberId: 'sub-2',
    objective: 'Condicionamento',
    description: 'Avaliacao inicial',
    notes: '',
    assessmentDate: '2026-10-05',
    weight: 65,
    measurements: { peito: 88, braco: 26, cintura: 68 },
  },
]

export const seedUsers: User[] = [
  { id: 'user-admin', email: 'admin@biggym.com', password: 'admin123', role: 'admin', refId: 'gym-1' },
  { id: 'user-prof', email: 'profissional@biggym.com', password: 'prof123', role: 'professional', refId: 'prof-1' },
  { id: 'user-sub', email: 'aluno@biggym.com', password: 'aluno123', role: 'subscriber', refId: 'sub-1' },
]