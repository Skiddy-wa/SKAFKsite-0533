import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

/** Cache genérico de respostas de APIs externas (CheapShark / Steam). */
export const apiCache = sqliteTable("api_cache", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

/** Jogos favoritados pelo usuário. */
export const wishlist = sqliteTable(
  "wishlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    gameId: text("game_id").notNull(),
    title: text("title").notNull(),
    thumb: text("thumb"),
    steamAppId: text("steam_app_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("wishlist_user_idx").on(t.userId)],
);

/** Alertas de preço por email. */
export const priceAlert = sqliteTable(
  "price_alert",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    gameId: text("game_id").notNull(),
    title: text("title").notNull(),
    thumb: text("thumb"),
    targetPrice: real("target_price").notNull(),
    lastNotifiedPrice: real("last_notified_price"),
    notifiedAt: integer("notified_at", { mode: "timestamp" }),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("price_alert_user_idx").on(t.userId)],
);
