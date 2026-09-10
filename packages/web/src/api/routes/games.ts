import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { fetchDeals, fetchGame, fetchSteamDetails, fetchStores, fetchUsdToBrl } from "../lib/cheapshark";

export const games = {
  /** Detalhe do jogo: info da CheapShark + Steam + comparação de preços por loja. */
  detail: base.input(z.object({ gameId: z.string() })).handler(async ({ input }) => {
    const [game, stores, usdToBrl] = await Promise.all([
      fetchGame(input.gameId).catch(() => null),
      fetchStores(),
      fetchUsdToBrl(),
    ]);

    if (!game?.info) throw new ORPCError("NOT_FOUND", { message: "Jogo não encontrado" });

    const storeById = new Map(stores.map((s) => [s.id, s]));
    const offers = (game.deals ?? [])
      .map((d) => ({
        storeId: d.storeID,
        storeName: storeById.get(d.storeID)?.name ?? `Loja ${d.storeID}`,
        storeIcon: storeById.get(d.storeID)?.icon ?? null,
        dealId: d.dealID,
        price: Number(d.price),
        retailPrice: Number(d.retailPrice),
        savings: Math.round(Number(d.savings)),
        link: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`,
      }))
      .sort((a, b) => a.price - b.price);

    const steamAppId = game.info.steamAppID;
    const steam = steamAppId ? await fetchSteamDetails(steamAppId) : null;

    return {
      gameId: input.gameId,
      title: game.info.title,
      thumb: game.info.thumb,
      steamAppId,
      cheapestEver: {
        price: Number(game.cheapestPriceEver?.price ?? 0),
        date: game.cheapestPriceEver?.date ?? null,
      },
      offers,
      steam,
      usdToBrl,
    };
  }),

  /** Busca rápida por título (usada no autocomplete do header). */
  search: base
    .input(z.object({ term: z.string().min(2), limit: z.number().min(1).max(20).optional() }))
    .handler(async ({ input }) => {
      const [items, usdToBrl] = await Promise.all([
        fetchDeals({
          title: input.term,
          pageSize: input.limit ?? 8,
          sortBy: "Deal Rating",
        }),
        fetchUsdToBrl(),
      ]);
      return { items, usdToBrl };
    }),
};
