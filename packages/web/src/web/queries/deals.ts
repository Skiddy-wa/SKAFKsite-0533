import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export type DealFilters = {
  storeId?: string;
  title?: string;
  upperPrice?: number;
  lowerPrice?: number;
  minSavings?: number;
  minRating?: number;
  sortBy?: "Deal Rating" | "Savings" | "Price" | "Metacritic" | "Reviews" | "Release" | "Recent";
  page?: number;
  pageSize?: number;
  aaa?: boolean;
};

export function useFeaturedDeals() {
  return useQuery(orpc.deals.featured.queryOptions({ staleTime: 5 * 60_000 }));
}

export function useDeals(filters: DealFilters) {
  return useQuery(
    orpc.deals.list.queryOptions({
      input: filters,
      staleTime: 2 * 60_000,
      placeholderData: (prev: unknown) => prev as never,
    }),
  );
}

export function useStores() {
  return useQuery(orpc.deals.stores.queryOptions({ staleTime: 12 * 60 * 60_000 }));
}

export function useGameSearch(term: string) {
  return useQuery(
    orpc.games.search.queryOptions({
      input: { term, limit: 6 },
      enabled: term.trim().length >= 2,
      staleTime: 60_000,
    }),
  );
}

export function useGameDetail(gameId: string) {
  return useQuery(
    orpc.games.detail.queryOptions({ input: { gameId }, staleTime: 5 * 60_000 }),
  );
}
