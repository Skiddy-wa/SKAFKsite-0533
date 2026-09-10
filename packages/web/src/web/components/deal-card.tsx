import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { brl, pct, ratingColor, steamHeader, usd } from "../lib/format";

export type DealItem = {
  dealId: string;
  gameId: string;
  title: string;
  salePrice: number;
  normalPrice: number;
  savings: number;
  steamRatingPercent: number;
  steamRatingText: string | null;
  metacritic: number;
  steamAppId: string | null;
  thumb: string;
  link: string;
};

type Props = {
  deal: DealItem;
  usdToBrl: number;
  saved?: boolean;
  onToggleSave?: (deal: DealItem) => void;
  size?: "default" | "wide";
};

export function DealCard({ deal, usdToBrl, saved, onToggleSave, size = "default" }: Props) {
  return (
    <article
      className={`group relative flex flex-col border border-line bg-ink-2 transition-all duration-200 hover:-translate-y-1 hover:border-magenta ${
        size === "wide" ? "md:flex-row" : ""
      }`}
    >
      <Link
        to={`/jogo/${deal.gameId}`}
        className={`relative block shrink-0 overflow-hidden ${size === "wide" ? "md:w-[46%]" : ""}`}
      >
        <img
          src={steamHeader(deal.steamAppId, deal.thumb)}
          alt={deal.title}
          loading="lazy"
          className="aspect-[460/215] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {deal.savings > 0 && (
          <span className="absolute left-0 top-0 bg-acid px-2.5 py-1 font-mono text-sm font-extrabold text-ink">
            {pct(deal.savings)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/jogo/${deal.gameId}`} className="flex-1">
            <h3 className="display line-clamp-2 text-xl leading-tight transition-colors group-hover:text-magenta md:text-2xl">
              {deal.title}
            </h3>
          </Link>
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(deal)}
              aria-label={saved ? "Remover da wishlist" : "Salvar na wishlist"}
              className="shrink-0 border border-line p-2 transition-colors hover:border-magenta"
            >
              <Heart
                className={`size-4 ${saved ? "fill-magenta text-magenta" : "text-ash"}`}
              />
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest text-ash">
          {deal.steamRatingPercent > 0 && (
            <span className={ratingColor(deal.steamRatingPercent)}>
              {deal.steamRatingPercent}% Steam
            </span>
          )}
          {deal.metacritic > 0 && (
            <span className="flex items-center gap-1">
              <Star className="size-3 text-amber" /> {deal.metacritic}
            </span>
          )}
          {deal.steamRatingText && (
            <span className="hidden sm:inline">{deal.steamRatingText}</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-extrabold text-acid">
                {brl(deal.salePrice, usdToBrl)}
              </span>
              {deal.normalPrice > deal.salePrice && (
                <span className="font-mono text-xs text-ash line-through">
                  {brl(deal.normalPrice, usdToBrl)}
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-ash">{usd(deal.salePrice)} na loja</span>
          </div>
          <a
            href={deal.link}
            target="_blank"
            rel="noreferrer"
            className="border border-line px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] transition-colors hover:border-acid hover:text-acid"
          >
            Pegar
          </a>
        </div>
      </div>
    </article>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="border border-line bg-ink-2">
      <div className="skeleton aspect-[460/215] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-7 w-1/3" />
      </div>
    </div>
  );
}
