import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { deals } from "./routes/deals";
import { games } from "./routes/games";
import { wishlist } from "./routes/wishlist";
import { alerts, runAlertCheck } from "./routes/alerts";
import { auth } from "./auth";

export const router = {
  ping,
  deals,
  games,
  wishlist,
  alerts,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

/** Revalida os alertas de preço e dispara os emails — chamado por um agendador externo. */
app.post("/api/cron/check-alerts", async (c) => {
  const result = await runAlertCheck();
  return c.json(result, 200);
});

export default app;
