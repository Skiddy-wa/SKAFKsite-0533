import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { fetchGame, fetchUsdToBrl } from "../lib/cheapshark";

export const wishlist = {
  /** Itens da wishlist do usuário com o menor preço atual entre as lojas. */
  list: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.wishlist)
      .where(eq(schema.wishlist.userId, context.user.id))
      .orderBy(desc(schema.wishlist.createdAt));

    const usdToBrl = await fetchUsdToBrl();

    const items = await Promise.all(
      rows.map(async (row) => {
        const game = await fetchGame(row.gameId).catch(() => null);
        const prices = (game?.deals ?? []).map((d) => Number(d.price));
        const retail = Number(game?.deals?.[0]?.retailPrice ?? 0);
        const best = prices.length ? Math.min(...prices) : null;
        return {
          ...row,
          bestPrice: best,
          retailPrice: retail || null,
          savings: best && retail ? Math.round(((retail - best) / retail) * 100) : 0,
          cheapestEver: Number(game?.cheapestPriceEver?.price ?? 0) || null,
        };
      }),
    );

    return { items, usdToBrl };
  }),

  /** Ids dos jogos salvos — usado para marcar o coração nos cards. */
  ids: authed.handler(async ({ context }) => {
    const rows = await db
      .select({ gameId: schema.wishlist.gameId })
      .from(schema.wishlist)
      .where(eq(schema.wishlist.userId, context.user.id));
    return rows.map((r) => r.gameId);
  }),

  toggle: authed
    .input(
      z.object({
        gameId: z.string(),
        title: z.string(),
        thumb: z.string().nullable().optional(),
        steamAppId: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const [existing] = await db
        .select()
        .from(schema.wishlist)
        .where(
          and(
            eq(schema.wishlist.userId, context.user.id),
            eq(schema.wishlist.gameId, input.gameId),
          ),
        )
        .limit(1);

      if (existing) {
        await db.delete(schema.wishlist).where(eq(schema.wishlist.id, existing.id));
        return { saved: false };
      }

      await db.insert(schema.wishlist).values({
        userId: context.user.id,
        gameId: input.gameId,
        title: input.title,
        thumb: input.thumb ?? null,
        steamAppId: input.steamAppId ?? null,
      });
      return { saved: true };
    }),

  remove: authed.input(z.object({ id: z.number() })).handler(async ({ input, context }) => {
    await db
      .delete(schema.wishlist)
      .where(and(eq(schema.wishlist.id, input.id), eq(schema.wishlist.userId, context.user.id)));
    return { ok: true };
  }),
};
