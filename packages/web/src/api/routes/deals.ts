import { z } from "zod";
import { base } from "../__core/app";
import { fetchDeals, fetchStores, fetchUsdToBrl } from "../lib/cheapshark";

const dealsInput = z.object({
  storeId: z.string().optional(),
  title: z.string().optional(),
  lowerPrice: z.number().optional(),
  upperPrice: z.number().optional(),
  minSavings: z.number().optional(),
  minRating: z.number().optional(),
  sortBy: z
    .enum(["Deal Rating", "Savings", "Price", "Metacritic", "Reviews", "Release", "Recent"])
    .optional(),
  page: z.number().min(0).max(50).optional(),
  pageSize: z.number().min(1).max(60).optional(),
  aaa: z.boolean().optional(),
});

export const deals = {
  /** Lista paginada de ofertas com filtros. */
  list: base.input(dealsInput).handler(async ({ input }) => {
    const [items, usdToBrl] = await Promise.all([fetchDeals(input), fetchUsdToBrl()]);
    return { items, usdToBrl, page: input.page ?? 0 };
  }),

  /** Blocos da home: oferta do dia, maiores descontos, baratinhos e bem avaliados. */
  featured: base.handler(async () => {
    const [top, biggest, cheap, rated, usdToBrl] = await Promise.all([
      fetchDeals({ sortBy: "Deal Rating", pageSize: 9 }),
      fetchDeals({ sortBy: "Savings", pageSize: 8, minSavings: 75 }),
      fetchDeals({ sortBy: "Price", pageSize: 8, upperPrice: 5 }),
      fetchDeals({ sortBy: "Metacritic", pageSize: 8, minRating: 80 }),
      fetchUsdToBrl(),
    ]);
    const [dealOfTheDay, ...rest] = top;
    return {
      dealOfTheDay: dealOfTheDay ?? null,
      top: rest,
      biggest,
      cheap,
      rated,
      usdToBrl,
    };
  }),

  /** Lojas ativas na CheapShark (para filtros e comparação). */
  stores: base.handler(() => fetchStores()),
};
