# Migração de paleta — vermelho para Emerald

**Contexto:** o sidebar foi redesenhado recentemente (fundo claro, cartão de perfil) e,
durante os ajustes, veio a vontade de repensar a cor de marca do sistema inteiro. Hoje
`rose-800`/`rose-700` é usada tanto pra marca (logo, botão primário, item ativo) quanto fica
visualmente próxima do `red-600` já usado pra ações de perigo (`Button` variant `danger`),
o que é um risco de confusão semântica num sistema de academia onde "cancelar matrícula"
e "confirmar pagamento" convivem na mesma tela.

**Decisão:** a cor de marca migra de rose para **Emerald** (`emerald-700` como base). Verde
também carrega sentido temático correto pro domínio (saúde, progresso, meta batida), e libera
o vermelho pra ser exclusivamente semântico (erro, cancelamento, inadimplência).

## Tokens de cor

| Papel | Antes | Depois |
|---|---|---|
| Fundo da tela | `zinc-100` | `zinc-100` (sem mudança) |
| Superfícies/cards | branco | branco (sem mudança) |
| Marca/ação primária (logo, botão primary, item ativo, focus ring) | `rose-800`/`rose-700` | `emerald-700` |
| Fundo de estado ativo/selecionado | `#FDECEF` | `#E7F6EF` |
| Hover leve sobre fundo claro | `rose-50` | `emerald-50` |
| Texto sobre fundo escuro de marca | `rose-100/*` | `emerald-100/*` |
| Perigo/cancelamento (`Button` variant `danger`) | `red-600` | `red-600` (sem mudança) |
| Neutros (texto, borda) | `slate-*`/`zinc-*` | sem mudança |

A logo (`biggym-logo.png`, silhueta branca usada como máscara CSS) passa a ser pintada de
`emerald-700` em vez de `rose-700` — mesma técnica de `mask-image` já aplicada no Sidebar,
sem precisar de um novo arquivo de imagem.

## Escopo — arquivos com `rose-*` hoje

- `src/components/common/Button.tsx` — variant `primary`
- `src/components/common/Input.tsx` — borda/ring de foco
- `src/components/common/SeletorDdi.tsx` — borda/ring de foco, item selecionado
- `src/components/layout/Sidebar.tsx` — logo, item ativo, hover, avatar placeholder
- `src/components/payment/PagamentoCheckout.tsx`
- `src/features/attendant/AttendantCadastroPage.tsx`
- `src/features/attendant/FaceIdPreview.tsx`
- `src/features/home/HomePage.tsx`
- `src/features/home/MatriculaPage.tsx`

Como `Button`, `Input` e `SeletorDdi` são componentes reutilizados pelas páginas, migrar
esses três primeiro já resolve a maior parte da superfície; os arquivos de feature são
ajustados em seguida, caso usem a cor diretamente (fora dos componentes comuns).

## Fora de escopo

- O verde já usado como indicador semântico de sucesso (ex: check de "pagamento aprovado"
  no comprovante, bolinha de sessão ativa no avatar do sidebar) **não muda** — continua
  verde. Antes isso destoava de propósito do rosa; agora coincide com a cor de marca, o que
  não é um problema (sucesso e marca podem compartilhar matiz), só deixa de ser um contraste
  deliberado.
- Nenhuma mudança de layout, espaçamento ou componente novo — é só substituição de token de
  cor nos arquivos listados.
