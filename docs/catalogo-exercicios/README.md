# Catálogo bruto de exercícios (ExerciseDB)

`exercicios-raw.json` é o dump completo dos 1.500 exercícios do tier gratuito do
ExerciseDB (`https://oss.exercisedb.dev/api/v1/exercises`, sem autenticação),
buscado em 2026-10-29. Cada item tem o formato original da API, em inglês:

```json
{
  "exerciseId": "01qpYSe",
  "name": "upward facing dog",
  "gifUrl": "https://static.exercisedb.dev/media/01qpYSe.gif",
  "bodyParts": ["back"],
  "equipments": ["bodyweight"],
  "targetMuscles": ["erector spinae"],
  "secondaryMuscles": ["deltoids", "pectorals"],
  "instructions": ["Step:1 ...", "Step:2 ...", "..."]
}
```

Esse arquivo **não é consumido pelo app** (não fica em `src/`) — é material de
referência pra, mais pra frente, gerar descrição/dificuldade em português pro
restante do catálogo via IA, igual foi feito pra criar os 100 primeiros
registros reais em `src/data/seed.ts` (`seedExercicios`).

`bodyParts` não bate 1:1 com o nosso `GrupoMuscular` (`src/types/exercicio.ts`).
Mapeamento usado:

| `bodyParts` (ExerciseDB) | `GrupoMuscular` (nosso) |
|---|---|
| chest | peito |
| back | costas |
| shoulders | ombro |
| upper arms, lower arms | braco |
| waist | abdomen |
| upper legs, lower legs | perna |
| cardio, neck | sem mapeamento direto — não usados nos 100 iniciais, ficam pendentes pro import completo |
