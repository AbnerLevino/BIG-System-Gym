// Rótulos e ícones de exercício/dia usados pelas telas do aluno (Treino, Objetivos).
// Ficam fora dos arquivos de página pra não quebrar o Fast Refresh do Vite.
import {
  Backpack,
  BicepsFlexed,
  Footprints,
  Grid3x3,
  HandMetal,
  Shirt,
  type LucideIcon,
} from 'lucide-react'
import type { DiaSemana, Exercicio } from '../../types'

export const LABEL_GRUPO_MUSCULAR: Record<Exercicio['grupoMuscular'], string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombro: 'Ombro',
  braco: 'Braço',
  abdomen: 'Abdômen',
  perna: 'Perna',
}

export const ICONE_GRUPO_MUSCULAR: Record<Exercicio['grupoMuscular'], LucideIcon> = {
  peito: Shirt,
  costas: Backpack,
  ombro: HandMetal,
  braco: BicepsFlexed,
  abdomen: Grid3x3,
  perna: Footprints,
}

export const GRUPOS_ORDEM: Exercicio['grupoMuscular'][] = ['peito', 'costas', 'ombro', 'braco', 'abdomen', 'perna']

export const LABEL_DIA_SEMANA: Record<DiaSemana, string> = {
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
  sabado: 'Sáb',
  domingo: 'Dom',
}
