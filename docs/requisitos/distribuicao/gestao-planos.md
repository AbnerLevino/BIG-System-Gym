# RF-ADM-01 — Gestão de planos

**Módulo:** Admin
**Ator:** Admin
**Status:** Em design — `AdminDashboardPage.tsx` e rotas de admin são hoje placeholder; `planoRepository.ts` já existe

## Descrição
Tela de listagem, criação e edição de `Plano` (nome, preço, modalidades, condições, origem/parceiro), em `/admin/planos` (path já previsto no `Sidebar.tsx`).

## Entidade (já definida em `src/types/plano.ts`)
```ts
export type OrigemPlano = 'direct' | 'partner'
export type NomeParceiro = 'totalpass' | 'wellhub'

export interface Plano {
  id: string
  name: string
  price: number
  modalities: string[]
  conditions: string
  origin: OrigemPlano
  partnerName?: NomeParceiro
}
```

## Onde mexer
- `src/features/admin/` (telas novas de listagem/criação/edição).
- Consumir `planoRepository.ts` (já existe) — não recriar persistência.

## Onde NÃO mexer
- Não criar conceito de plano "descontinuado" (D2) — sem campo ou status de inativação.
- Não implementar lógica de congelamento de preço aqui — isso é garantido por `docs/requisitos/fundacao/motor-cobranca-inadimplencia.md` (D1); esta tela só precisa confirmar visualmente que mudar o preço não altera pagamento já gerado.

## Critério de aceite
- Dado que um `Plano` tem `origin: 'partner'`, quando cadastrado/editado, então `partnerName` é obrigatório e restrito a `'totalpass' | 'wellhub'`.
- Dado que um `Plano` existente tem seu `price` alterado, quando a alteração é salva, então nenhum `Pagamento` já gerado é modificado (ver RF-FUND-02/D1).
- Listagem reflete os planos cadastrados via `planoRepository.ts` — sem lista mockada na própria tela.
