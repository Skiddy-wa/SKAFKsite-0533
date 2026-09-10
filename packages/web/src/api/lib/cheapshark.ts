import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

const BASE = "https://www.cheapshark.com/api/1.0";
const UA = "SkafkPromocoes/1.0 (https://skafk.app; contato@skafk.app)";

/** Busca com cache em banco (TTL em segundos) para não estourar rate limit das APIs. */
export async function cachedFetch<T>(key: string, url: string, ttlSeconds: number): Promise<T> {
  const now = new Date();
  const [hit] = await db
    .select()
    .from(schema.apiCache)
    .where(eq(schema.apiCache.key, key))
    .limit(1);

  if (hit && hit.expiresAt > now) {
    return JSON.parse(hit.payload) as T;
  }

  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) {
    if (hit) return JSON.parse(hit.payload) as T;
    throw new Error(`Falha ao consultar ${url}: ${res.status}`);
  }
  const data = (await res.json()) as T;

  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
  const payload = JSON.stringify(data);
  await db
    .insert(schema.apiCache)
    .values({ key, payload, expiresAt })
    .onConflictDoUpdate({ target: schema.apiCache.key, set: { payload, expiresAt } });

  return data;
}

export type RawDeal = {
  internalName: string;
  title: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
};

export type Deal = {
  dealId: string;
  gameId: string;
  storeId: string;
  title: string;
  salePrice: number;
  normalPrice: number;
  savings: number;
  metacritic: number;
  steamRatingText: string | null;
  steamRatingPercent: number;
  steamRatingCount: number;
  steamAppId: string | null;
  releaseDate: number;
  dealRating: number;
  thumb: string;
  link: string;
};

export function normalizeDeal(d: RawDeal): Deal {
  return {
    dealId: d.dealID,
    gameId: d.gameID,
    storeId: d.storeID,
    title: d.title,
    salePrice: Number(d.salePrice),
    normalPrice: Number(d.normalPrice),
    savings: Math.round(Number(d.savings)),
    metacritic: Number(d.metacriticScore) || 0,
    steamRatingText: d.steamRatingText || null,
    steamRatingPercent: Number(d.steamRatingPercent) || 0,
    steamRatingCount: Number(d.steamRatingCount) || 0,
    steamAppId: d.steamAppID || null,
    releaseDate: d.releaseDate,
    dealRating: Number(d.dealRating) || 0,
    thumb: d.thumb,
    link: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`,
  };
}

export type DealsQuery = {
  storeId?: string;
  title?: string;
  lowerPrice?: number;
  upperPrice?: number;
  minSavings?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
  aaa?: boolean;
};

export async function fetchDeals(q: DealsQuery): Promise<Deal[]> {
  const params = new URLSearchParams();
  params.set("storeID", q.storeId ?? "1");
  params.set("pageNumber", String(q.page ?? 0));
  params.set("pageSize", String(q.pageSize ?? 24));
  params.set("sortBy", q.sortBy ?? "Deal Rating");
  params.set("onSale", "1");
  if (q.title) params.set("title", q.title);
  if (q.lowerPrice !== undefined) params.set("lowerPrice", String(q.lowerPrice));
  if (q.upperPrice !== undefined) params.set("upperPrice", String(q.upperPrice));
  if (q.minSavings !== undefined) params.set("desc", "0");
  if (q.minRating) params.set("steamRating", String(q.minRating));
  if (q.aaa) params.set("AAA", "1");

  const url = `${BASE}/deals?${params.toString()}`;
  const raw = await cachedFetch<RawDeal[]>(`deals:${params.toString()}`, url, 30 * 60);
  const deals = (Array.isArray(raw) ? raw : []).map(normalizeDeal);
  return q.minSavings ? deals.filter((d) => d.savings >= q.minSavings!) : deals;
}

export type RawStore = {
  storeID: string;
  storeName: string;
  isActive: number;
  images: { banner: string; logo: string; icon: string };
};

export type Store = { id: string; name: string; icon: string; active: boolean };

export async function fetchStores(): Promise<Store[]> {
  const raw = await cachedFetch<RawStore[]>("stores", `${BASE}/stores`, 24 * 60 * 60);
  return raw
    .filter((s) => s.isActive === 1)
    .map((s) => ({
      id: s.storeID,
      name: s.storeName,
      icon: `https://www.cheapshark.com${s.images.icon}`,
      active: true,
    }));
}

export type RawGameLookup = {
  info: { title: string; steamAppID: string | null; thumb: string };
  cheapestPriceEver: { price: string; date: number };
  deals: { storeID: string; dealID: string; price: string; retailPrice: string; savings: string }[];
};

export async function fetchGame(gameId: string) {
  const raw = await cachedFetch<RawGameLookup>(
    `game:${gameId}`,
    `${BASE}/games?id=${encodeURIComponent(gameId)}`,
    30 * 60,
  );
  return raw;
}

export type SteamDetails = {
  description: string;
  headerImage: string | null;
  background: string | null;
  screenshots: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  releaseDate: string | null;
  metacritic: number | null;
  windows: boolean;
  mac: boolean;
  linux: boolean;
};

type SteamRaw = Record<
  string,
  {
    success: boolean;
    data?: {
      short_description?: string;
      header_image?: string;
      background_raw?: string;
      screenshots?: { path_thumbnail: string; path_full: string }[];
      genres?: { description: string }[];
      developers?: string[];
      publishers?: string[];
      release_date?: { date?: string };
      metacritic?: { score?: number };
      platforms?: { windows?: boolean; mac?: boolean; linux?: boolean };
    };
  }
>;

export async function fetchSteamDetails(appId: string): Promise<SteamDetails | null> {
  try {
    const raw = await cachedFetch<SteamRaw>(
      `steam:${appId}`,
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=portuguese&cc=br`,
      6 * 60 * 60,
    );
    const entry = raw?.[appId];
    if (!entry?.success || !entry.data) return null;
    const d = entry.data;
    return {
      description: d.short_description ?? "",
      headerImage: d.header_image ?? null,
      background: d.background_raw ?? null,
      screenshots: (d.screenshots ?? []).slice(0, 6).map((s) => s.path_full),
      genres: (d.genres ?? []).map((g) => g.description),
      developers: d.developers ?? [],
      publishers: d.publishers ?? [],
      releaseDate: d.release_date?.date ?? null,
      metacritic: d.metacritic?.score ?? null,
      windows: Boolean(d.platforms?.windows),
      mac: Boolean(d.platforms?.mac),
      linux: Boolean(d.platforms?.linux),
    };
  } catch {
    return null;
  }
}

/** Cotação USD→BRL, cacheada por 6h; usa fallback fixo se a API falhar. */
export async function fetchUsdToBrl(): Promise<number> {
  try {
    const data = await cachedFetch<{ USDBRL?: { bid?: string } }>(
      "fx:usdbrl",
      "https://economia.awesomeapi.com.br/last/USD-BRL",
      6 * 60 * 60,
    );
    const bid = Number(data?.USDBRL?.bid);
    return Number.isFinite(bid) && bid > 0 ? bid : 5.4;
  } catch {
    return 5.4;
  }
}
