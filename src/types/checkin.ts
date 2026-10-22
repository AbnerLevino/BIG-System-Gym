// Registro de entrada na catraca. accessGranted é calculado no momento do check-in
// (ver possuiAcessoLiberado em checkinRepository.ts) e fica congelado aqui como
// histórico — a regra em si nunca é salva separada, só recalculada.
export type MetodoCheckin = 'faceId' | 'manual'

export interface CheckIn {
  id: string
  alunoId: string
  timestamp: string
  method: MetodoCheckin
  accessGranted: boolean
}
