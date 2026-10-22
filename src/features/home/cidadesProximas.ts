// Conteudo de marketing para a Home - nao representa unidades reais no banco
// (hoje so existe uma Academia no sistema, ver src/types/academia.ts).
export interface CidadeProxima {
  nome: string
  distanciaKm: number
  endereco: string
}

export const CIDADES_PROXIMAS: CidadeProxima[] = [
  { nome: 'Sao Paulo', distanciaKm: 0, endereco: 'Av. Paulista, 1500' },
  { nome: 'Guarulhos', distanciaKm: 18, endereco: 'Av. Paulo Faccini, 850' },
  { nome: 'Osasco', distanciaKm: 22, endereco: 'Av. dos Autonomistas, 400' },
  { nome: 'Santo Andre', distanciaKm: 25, endereco: 'Rua Senador Fláquer, 120' },
  { nome: 'Diadema', distanciaKm: 28, endereco: 'Av. Piraporinha, 600' },
  { nome: 'Barueri', distanciaKm: 31, endereco: 'Av. Henrique Sapori, 980' },
  { nome: 'Maua', distanciaKm: 33, endereco: 'Av. Barão de Mauá, 300' },
  { nome: 'Cotia', distanciaKm: 36, endereco: 'Rua José Joaquim, 210' },
]
