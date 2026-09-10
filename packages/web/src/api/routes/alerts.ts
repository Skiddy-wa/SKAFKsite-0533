import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { fetchGame, fetchStores, fetchUsdToBrl } from "../lib/cheapshark";
import { priceAlertEmail, sendEmail } from "../services/email";

export const alerts = {
  list: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.priceAlert)
      .where(eq(schema.priceAlert.userId, context.user.id))
      .orderBy(desc(schema.priceAlert.createdAt));

    const [items, usdToBrl] = await Promise.all([
      Promise.all(
        rows.map(async (row) => {
          const game = await fetchGame(row.gameId).catch(() => null);
          const prices = (game?.deals ?? []).map((d) => Number(d.price));
          return { ...row, currentPrice: prices.length ? Math.min(...prices) : null };
        }),
      ),
      fetchUsdToBrl(),
    ]);

    return { items, usdToBrl };
  }),

  create: authed
    .input(
      z.object({
        gameId: z.string(),
        title: z.string(),
        thumb: z.string().nullable().optional(),
        targetPrice: z.number().positive(),
        email: z.string().email().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const email = input.email ?? context.user.email;
      const [existing] = await db
        .select()
        .from(schema.priceAlert)
        .where(
          and(
            eq(schema.priceAlert.userId, context.user.id),
            eq(schema.priceAlert.gameId, input.gameId),
          ),
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(schema.priceAlert)
          .set({ targetPrice: input.targetPrice, email, active: true, notifiedAt: null })
          .where(eq(schema.priceAlert.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(schema.priceAlert)
        .values({
          userId: context.user.id,
          email,
          gameId: input.gameId,
          title: input.title,
          thumb: input.thumb ?? null,
          targetPrice: input.targetPrice,
        })
        .returning();
      return created;
    }),

  remove: authed.input(z.object({ id: z.number() })).handler(async ({ input, context }) => {
    await db
      .delete(schema.priceAlert)
      .where(
        and(eq(schema.priceAlert.id, input.id), eq(schema.priceAlert.userId, context.user.id)),
      );
    return { ok: true };
  }),

  toggle: authed
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .handler(async ({ input, context }) => {
      const [updated] = await db
        .update(schema.priceAlert)
        .set({ active: input.active })
        .where(
          and(eq(schema.priceAlert.id, input.id), eq(schema.priceAlert.userId, context.user.id)),
        )
        .returning();
      return updated;
    }),
};

/** Revalida todos os alertas ativos e dispara email quando o preço bate o alvo. */
export async function runAlertCheck() {
  const rows = await db
    .select()
    .from(schema.priceAlert)
    .where(eq(schema.priceAlert.active, true));

  const [stores, usdToBrl] = await Promise.all([fetchStores(), fetchUsdToBrl()]);
  const storeById = new Map(stores.map((s) => [s.id, s]));
  const siteUrl = process.env.WEBSITE_URL ?? "https://skafk.app";
  let notified = 0;

  for (const row of rows) {
    const game = await fetchGame(row.gameId).catch(() => null);
    const best = (game?.deals ?? [])
      .map((d) => ({ price: Number(d.price), dealId: d.dealID, storeId: d.storeID }))
      .sort((a, b) => a.price - b.price)[0];
    if (!best || best.price > row.targetPrice) continue;
    if (row.lastNotifiedPrice !== null && best.price >= row.lastNotifiedPrice) continue;

    await sendEmail({
      to: row.email,
      subject: `${row.title} caiu para ${(best.price * usdToBrl).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}`,
      html: priceAlertEmail({
        title: row.title,
        price: best.price,
        target: row.targetPrice,
        storeName: storeById.get(best.storeId)?.name ?? "loja parceira",
        link: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(best.dealId)}`,
        thumb: row.thumb,
        siteUrl,
        usdToBrl,
      }),
    });

    await db
      .update(schema.priceAlert)
      .set({ lastNotifiedPrice: best.price, notifiedAt: new Date() })
      .where(eq(schema.priceAlert.id, row.id));
    notified += 1;
  }

  return { checked: rows.length, notified };
}
