# Skafk Promoções — Design

Site web (React + Vite, servido pelo template gerenciado) que mostra promoções reais de jogos da
Steam e outras lojas usando a API pública da CheapShark + Steam. Direção visual: **dark editorial
agressivo** — fundo quase preto, tipografia display gigante em caixa alta, acento magenta neon,
verde ácido para descontos, grid quebrado e textura de ruído. Referência: pôster/landing de
coleção NFT dark com blocos de tipo enorme e faixas coloridas.

## Brand & Colors

Tokens em `packages/web/src/web/styles.css` (`@theme` do Tailwind 4). App é dark-only.

| Token | Valor | Uso |
|-------|-------|-----|
| ink | #08080A | Fundo da página |
| ink-2 | #101014 | Superfícies/cards |
| ink-3 | #17171D | Card hover, inputs |
| bone | #F4F1EA | Texto primário (off-white, não branco puro) |
| ash | #8A8896 | Texto secundário |
| line | #23232B | Hairlines/bordas |
| magenta | #FF1F6B | Acento primário (CTAs, marca, destaques) |
| acid | #C6FF3D | Descontos, preço em promoção, "melhor preço" |
| amber | #FFB020 | Notas/reviews |
| danger | #FF4A3D | Erros |

Regras: magenta e acid são acentos — nunca fundo de área grande. Desconto sempre em `acid` sobre
`ink`. Preço antigo em `ash` riscado. Nada de gradiente roxo, nada de card branco arredondado.

## Typography

- **Display**: `Anton` (Google Fonts) — caixa alta, tracking negativo, tamanhos de 48px a 160px.
- **Body/UI**: `Manrope` (Google Fonts) — 14–18px, line-height 1.6.
- **Mono**: `JetBrains Mono` — preços, percentuais, contadores.

Carregadas por `<link>` do Google Fonts em `packages/web/index.html`.

## Layout

- Container 1440px, padding lateral 24–48px.
- Grid quebrado: hero em bloco full-bleed, "oferta do dia" ocupando 2 colunas, cards em alturas
  alternadas.
- Textura de ruído em overlay (SVG data-uri em CSS) + linhas de grade sutis.
- Bordas retas (radius 0–4px), hairline `line`, hover eleva com borda magenta.
- Motion: reveal escalonado no load (Motion/`framer-motion` via CSS), hover com translate curto.

## Pages

- **Home** (`src/web/pages/index.tsx`) — hero com contador de ofertas, oferta do dia, top descontos,
  faixas (abaixo de $5, 75%+ off, bem avaliados).
- **Ofertas** (`src/web/pages/deals.tsx`) — busca, filtros (loja, % mínimo, preço máximo, nota
  mínima), ordenação, paginação.
- **Jogo** (`src/web/pages/game.tsx`) — capa/screenshots da Steam, descrição, menor preço histórico,
  tabela comparativa por loja, botão de wishlist e de alerta de preço.
- **Wishlist** (`src/web/pages/wishlist.tsx`) — jogos salvos com preço atual.
- **Alertas** (`src/web/pages/alerts.tsx`) — alertas de preço por email, criar/remover.
- **Entrar** (`src/web/pages/login.tsx`) — Google (managed auth) + email/senha, tabs num só card.

## Flows

1. Visitante abre a Home → vê ofertas reais do dia → clica num jogo → vê comparação de preços →
   clica em "Pegar na loja" (link de redirect da CheapShark).
2. Usuário logado salva na wishlist e cria alerta: define preço-alvo → recebe email quando o preço
   cai abaixo do alvo (checagem via endpoint `/api/cron/check-alerts`).

## Architecture

- Dados externos: CheapShark (`/deals`, `/games`, `/stores`) e Steam `appdetails`, sempre com
  User-Agent próprio. Respostas cacheadas na tabela `api_cache` (TTL 30 min) para evitar rate limit.
- API oRPC: `deals.list`, `deals.featured`, `games.detail`, `stores.list`, `wishlist.*`, `alerts.*`.
- Auth: Better Auth + Runable managed auth (Google) e email/senha.
- Front: TanStack Query com hooks em `src/web/queries/`.
