# Skafk promoções — progresso

## Feito
- [x] app_init + design.md (dark editorial, Anton/Manrope/JetBrains Mono, magenta + acid)
- [x] Schema: auth-schema, api_cache, wishlist, price_alert (db:push aplicado)
- [x] lib/cheapshark.ts com cache em banco + TTL, Steam appdetails (pt-BR), cotação USD→BRL
- [x] Rotas oRPC: deals (list/featured/stores), games (detail/search), wishlist, alerts
- [x] Endpoint HTTP POST /api/cron/check-alerts + email via Resend (degrada sem key)
- [x] Auth: Better Auth + managed Google + email/senha
- [x] Páginas: / (home), /ofertas, /jogo/:id, /wishlist, /alertas, /entrar, 404
- [x] Rotas no app.tsx
- [x] bun run build OK, bun run lint OK
- [x] Dev server na porta 4200, páginas verificadas no navegador
- [x] Entregue ao usuário

## Conversão para real (feito)
- [x] R$ como preço principal em todos os lugares (cards, home, /ofertas, jogo, wishlist, alertas, autocomplete)
- [x] US$ virou nota secundária ("US$ 15.71 na loja")
- [x] Filtro de preço máximo em R$ (25/50/100/250) — converte para USD na chamada da API (param de URL `maxBrl`)
- [x] Alerta de preço: input em R$, salvo em USD internamente
- [x] Email de alerta e assunto em R$
- [x] alerts.list e games.search agora devolvem usdToBrl
- [x] build + lint OK, verificado no navegador

## Pendente / opcional
- [ ] RESEND_API_KEY no .env raiz para os alertas realmente enviarem email
- [ ] Agendar chamada periódica de /api/cron/check-alerts
