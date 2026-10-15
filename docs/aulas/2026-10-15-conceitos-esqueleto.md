# Aula: Conceitos do Esqueleto do BigGym

Este documento explica o **porquê** de cada arquivo que você vai criar seguindo o plano (`docs/superpowers/plans/2026-10-15-biggym-skeleton.md`). Não repete o código — é pra ler antes ou durante cada task, pra entender a ideia por trás do que você está digitando.

---

## 1. Arquivos de configuração (Task 1)

### `package.json`
**O que é:** a "identidade" do projeto Node — nome, versão, scripts que você pode rodar (`npm run dev`), e lista de dependências.
**Por que existe:** sem ele, `npm install` não sabe o que instalar, e não existe projeto Node de fato.
**Quando criar um:** uma vez, no início do projeto. Você só volta a editá-lo quando instala uma biblioteca nova (ex: Recharts, jsPDF, mais pra frente).
**Conceito-chave:** `dependencies` (vai pro navegador do usuário final, ex: React) vs `devDependencies` (só ajuda você a desenvolver, ex: TypeScript, Tailwind) — essa distinção existe porque, ao gerar o build de produção, só o que está em `dependencies` (mais o que foi de fato usado) acaba no pacote final.

### `tsconfig.json` / `tsconfig.node.json`
**O que é:** as regras que o compilador TypeScript usa pra checar seu código (o quão "estrito" ele é, pra qual versão de JavaScript ele traduz, etc).
**Por que existe:** TypeScript não é a linguagem que o navegador entende — ele é convertido pra JavaScript. Esse arquivo diz como fazer essa conversão e quais erros devem travar o build.
**Quando criar:** uma vez; raramente se edita depois, a menos que surja um erro de configuração.
**Conceito-chave:** `strict: true` liga todas as verificações rígidas do TypeScript (ex: não deixa você usar uma variável que pode ser `null` sem checar antes). É mais chato no começo, mas evita bug bobo de "esqueci de tratar esse caso".

### `vite.config.ts`
**O que é:** configuração do Vite, a ferramenta que serve seu projeto em desenvolvimento (`npm run dev`) e gera o pacote final (`npm run build`).
**Por que existe:** o navegador não entende JSX (`<div>` dentro de JavaScript) nem importa arquivos `.tsx` nativamente — o Vite transforma isso em tempo real.
**Conceito-chave:** "bundler" — uma ferramenta que junta todos os seus arquivos pequenos (`.tsx`, `.css`) em poucos arquivos otimizados pra entregar ao navegador.

### `tailwind.config.js` / `postcss.config.js`
**O que é:** configuração do Tailwind CSS (framework de estilo via classes utilitárias, ex: `className="bg-slate-900 p-4"`) e do PostCSS (ferramenta que processa esse CSS antes de ir pro navegador).
**Por que existe:** Tailwind precisa saber **onde procurar** as classes que você usa (`content: ['./src/**/*.tsx']`) pra gerar só o CSS que você realmente usa — isso mantém o arquivo final pequeno.
**Conceito-chave:** você não escreve CSS num arquivo `.css` separado pra cada componente; escreve classes direto no JSX. É uma troca deliberada: mais rápido de estilizar, mas o HTML fica mais "poluído" visualmente.

### `index.html` / `src/main.tsx`
**O que é:** `index.html` é a única página HTML real do projeto (projeto é uma SPA — Single Page Application). `main.tsx` é o ponto de entrada do React: ele pega a `<div id="root">` do HTML e "planta" o React dentro dela.
**Conceito-chave:** `ReactDOM.createRoot(...).render(<App />)` — essa linha é a ponte entre o HTML puro e o mundo React. Tudo que acontece depois (rotas, componentes) vive dentro dessa raiz.

---

## 2. Tipos / `src/types` (Task 3)

**O que é:** interfaces TypeScript descrevendo o formato exato de cada entidade (`Subscriber`, `Payment`, etc), sem nenhuma lógica — só a "forma do dado".
**Por que existe:** é o **contrato** entre as partes do sistema e entre as pessoas do grupo. Se todo mundo usa `Subscriber` com os mesmos campos, o código de uma pessoa encaixa no de outra sem conversa.
**Quando criar um arquivo de tipo:** quando uma entidade nova aparece no domínio do negócio (olhando o spec, seção 4). Não crie tipos pra "agrupar" dados que não representam uma entidade real — isso é abstração prematura.
**Conceito-chave:** tipo é **checado em tempo de compilação, não existe em tempo de execução**. Ou seja, `interface Subscriber {...}` não gera nenhum código JavaScript — é só uma ferramenta pra o TypeScript (e pra você) saber se está usando o dado certo, antes mesmo de rodar o programa.

---

## 3. Camada de dados / `src/data` (Task 4)

### `storage.ts`
**O que é:** três funções genéricas (`readCollection`, `writeCollection`, `ensureSeeded`) que sabem conversar com `localStorage`.
**Por que existe:** `localStorage` só guarda texto (string). Toda vez que você quer salvar uma lista de objetos, precisa converter pra texto (`JSON.stringify`) e, pra ler, converter de volta (`JSON.parse`). Se cada arquivo fizesse isso na mão, teria código repetido e fácil de errar.
**Conceito-chave:** isso é **genérico** (`<T>`) — a mesma função serve pra guardar `Subscriber[]`, `Payment[]`, `User[]`, etc, porque ela não sabe (nem precisa saber) o que tem dentro, só sabe guardar/ler uma lista.

### `seed.ts`
**O que é:** os dados de exemplo (mock) que populam o sistema na primeira vez que alguém abre o app.
**Por que existe:** sem isso, o sistema abriria vazio e ninguém conseguiria testar nada sem cadastrar tudo manualmente primeiro.
**Quando editar:** quando sua feature precisa de mais exemplos pra testar (ex: mais um aluno inadimplente pra testar a tela de financeiro).

### `*Repository.ts` (ex: `subscriberRepository.ts`)
**O que é:** um arquivo por entidade, com funções de leitura/escrita específicas daquela entidade (`getSubscribers()`, `saveSubscriber(...)`).
**Por que existe:** isso é o **padrão Repository** — ele esconde "como" o dado é guardado (hoje é `localStorage`; se um dia vocês colocarem um banco de dados real, só esse arquivo muda) atrás de funções com nome claro sobre "o quê" elas fazem.
**Regra de ouro:** nenhuma tela (`features/...`) deve chamar `localStorage` diretamente — ela chama `getSubscribers()` e pronto. Isso é a "separação de responsabilidade" que você já tinha identificado.

---

## 4. Store de autenticação / `src/store/authStore.ts` (Task 5)

**O que é:** usa a biblioteca Zustand pra guardar, em memória (e também persistido em `localStorage`), **quem está logado agora**.
**Por que existe:** várias partes do app precisam saber "quem é o usuário atual" (a sidebar, pra saber quais links mostrar; as rotas, pra saber se deixa entrar) — sem um lugar central, cada componente teria que descobrir isso sozinho.
**Conceito-chave — "estado global":** diferente do `useState` de um componente (que morre quando o componente desmonta), o estado no Zustand vive fora da árvore de componentes e qualquer um pode ler ou mudar ele chamando `useAuthStore(...)`.
**Quando criar um store novo:** quando um dado precisa ser lido por **componentes que não têm relação de pai/filho entre si** (ex: sidebar e topbar, ambos precisam saber o usuário logado, mas um não é filho do outro). Se o dado é usado só dentro de uma tela, não precisa de store — usa `useState` normal.

---

## 5. Componentes comuns / `src/components/common` (Task 6)

**O que é:** `Button`, `Input`, `Card`, `Table`, `Modal` — peças de interface reutilizáveis em qualquer tela.
**Conceito-chave — "componente burro" (presentational component):** eles recebem dados via `props` e não sabem nada sobre `localStorage`, Zustand, ou regra de negócio. Um `<Table columns={...} rows={...} />` não sabe se as `rows` vieram de alunos ou de pagamentos — ele só sabe desenhar uma tabela.
**Por que isso importa pro trabalho em grupo:** como esses componentes não têm lógica de negócio, qualquer colega pode usá-los sem precisar entender como funcionam por dentro — só precisa saber quais `props` passar.
**Quando criar um componente aqui:** quando um pedaço de UI (visual) se repete em telas de features diferentes. Se é algo usado só numa tela específica, ele deve morar dentro da pasta daquela feature, não aqui.

---

## 6. Layout / `src/components/layout` (Task 7)

**O que é:** `Sidebar` (menu lateral, muda de acordo com o papel do usuário) e `AppLayout` (a "moldura" — sidebar + topbar + espaço pro conteúdo da página).
**Conceito-chave — "composição":** em vez de cada página repetir "sidebar + topbar + conteúdo", ela só faz `<AppLayout>{conteúdo da página}</AppLayout>`. O `AppLayout` recebe `children` (o conteúdo) e decide onde encaixar.
**Por que a Sidebar fica separada do AppLayout:** porque ela tem uma responsabilidade específica (decidir os links por papel) — se um dia quiser trocar o menu sem tocar na estrutura geral da página, só edita um arquivo.

---

## 7. Rotas / `src/routes` (Task 8)

### `ProtectedRoute.tsx`
**O que é:** um componente que não renderiza UI própria — ele **decide** se deixa passar pro conteúdo de verdade ou redireciona.
**Conceito-chave — "guard" (guarda de rota):** antes de mostrar `<AdminDashboardPage />`, ele checa "existe usuário logado? o papel dele é `admin`?" Se não, manda pra `/login` ou pro dashboard certo do usuário. Isso é o que implementa a regra "acesso fora do papel redireciona de volta" do spec.

### `AppRoutes.tsx`
**O que é:** a lista central de todas as URLs do sistema e qual componente cada uma renderiza.
**Por que fica centralizado:** se as rotas estivessem espalhadas, ninguém saberia todas as URLs que existem sem ler cada feature. Com um arquivo só, dá pra ver o mapa completo do app numa olhada (e bate com o "Mapa de Páginas" do spec, seção 5).

---

## 8. Fluxo de Git (branch / PR) — revisão rápida

Já conversamos sobre isso em detalhe (está no `CONTRIBUTING.md` da Task 9), mas o conceito central vale repetir aqui: **branch** é uma cópia paralela do código onde você trabalha sem afetar o `main`; **Pull Request** é o pedido formal de juntar essa cópia de volta, com revisão antes de aceitar. Isso existe pra que o `main` — a versão "oficial" — nunca fique quebrado enquanto alguém está no meio de uma tarefa.

---

## Ordem recomendada pra estudar enquanto implementa

1. Configuração (Task 1) — só overhead necessário, não precisa dominar, só entender que existe.
2. Types (Task 3) — leia a seção 4 do spec junto, pra ver a entidade "de negócio" e o tipo TypeScript lado a lado.
3. Data layer (Task 4) — entenda `storage.ts` primeiro (genérico), depois um repository (ex: `subscriberRepository.ts`) pra ver o padrão se repetindo.
4. Store (Task 5) — só faz sentido depois de entender que "vários componentes sem relação entre si" precisam do mesmo dado.
5. Componentes comuns e layout (Tasks 6 e 7) — mais visual, mais intuitivo, pode ir rápido.
6. Rotas (Task 8) — é onde tudo se conecta; vale revisar os conceitos anteriores antes de chegar aqui.
