# Como contribuir no BigGym

Guia rapido para quem nunca trabalhou com Git em equipe. Siga esses passos sempre que for comecar uma tarefa.

## 1. Antes de comecar, atualize sua copia local

```bash
git checkout main
git pull origin main
```

## 2. Crie um branch para a sua tarefa

Nunca trabalhe direto no `main`. Crie um branch com esse padrao de nome:

```bash
git checkout -b feature/<area>-<descricao-curta>
```

Exemplos:
- `feature/admin-planos`
- `feature/profissional-treinos`
- `feature/aluno-evolucao`
- `feature/financial-pagamentos`

## 3. Trabalhe e comite em pequenos passos

```bash
git add <arquivos-que-voce-mudou>
git commit -m "feat: descricao curta do que foi feito"
```

Comite com frequencia (a cada pedaco que funciona), nao espere terminar tudo para comitar uma vez só.

## 4. Envie seu branch para o GitHub

```bash
git push origin feature/<area>-<descricao-curta>
```

## 5. Abra um Pull Request (PR)

No GitHub, vai aparecer um botao "Compare & pull request" depois do push. Clique nele, escreva o que voce fez e marque o responsavel pela revisao (quem integra o projeto) como revisor.

## 6. Aguarde a revisao

Quem revisar pode pedir ajustes nos comentarios do PR. Faca as mudancas no mesmo branch, comite e empurre de novo (`git push`) — o PR atualiza automaticamente, nao precisa abrir um novo.

## 7. Depois do merge

Quando o PR for aprovado e "mergeado" no `main`, volte ao passo 1 para a proxima tarefa.

## Regras importantes

- **Nunca** use `git push --force` ou `git push origin main` direto.
- Cada feature so pode importar de `types`, `data`, `store`, `components` e `utils` — nunca de outra feature (ex: a feature `admin` nao importa nada de dentro de `features/subscriber`).
- Se precisar de algo que esta em outra feature, avise quem revisa o projeto antes de duplicar codigo.
- Nomes de arquivos, tipos e variaveis em ingles. Textos de tela, rotas e commits em portugues.
