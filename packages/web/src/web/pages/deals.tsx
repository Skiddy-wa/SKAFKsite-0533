import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Layout } from "../components/layout";
import { DealCard, DealCardSkeleton, type DealItem } from "../components/deal-card";
import { useDeals, useStores, type DealFilters } from "../queries/deals";
import { useSavedGames } from "../hooks/use-saved-games";

const SORTS: { value: NonNullable<DealFilters["sortBy"]>; label: string }[] = [
  { value: "Deal Rating", label: "Melhor negócio" },
  { value: "Savings", label: "Maior desconto" },
  { value: "Price", label: "Menor preço" },
  { value: "Metacritic", label: "Metacritic" },
  { value: "Reviews", label: "Mais avaliados" },
  { value: "Recent", label: "Mais recentes" },
];

const SAVINGS = [0, 25, 50, 75, 90];
const PRICES_BRL = [0, 25, 50, 100, 250];
const RATINGS = [0, 60, 70, 80, 90];

export default function DealsPage() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [title, setTitle] = useState(params.get("q") ?? "");
  const [storeId, setStoreId] = useState(params.get("storeId") ?? "1");
  const [minSavings, setMinSavings] = useState(Number(params.get("minSavings") ?? 0));
  const [maxBrl, setMaxBrl] = useState(Number(params.get("maxBrl") ?? 0));
  const [minRating, setMinRating] = useState(Number(params.get("minRating") ?? 0));
  const [rate, setRate] = useState(5.4);
  const [sortBy, setSortBy] = useState<NonNullable<DealFilters["sortBy"]>>("Deal Rating");
  const [page, setPage] = useState(0);
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    setTitle(params.get("q") ?? "");
    setMinSavings(Number(params.get("minSavings") ?? 0));
    setMaxBrl(Number(params.get("maxBrl") ?? 0));
    setMinRating(Number(params.get("minRating") ?? 0));
    setPage(0);
  }, [params]);

  const filters: DealFilters = {
    storeId,
    title: title.trim() || undefined,
    minSavings: minSavings || undefined,
    upperPrice: maxBrl ? Number((maxBrl / rate).toFixed(2)) : undefined,
    minRating: minRating || undefined,
    sortBy,
    page,
    pageSize: 24,
  };

  const deals = useDeals(filters);
  const stores = useStores();
  const { isSaved, toggleSave } = useSavedGames();
  const items = (deals.data?.items ?? []) as DealItem[];
  const liveRate = deals.data?.usdToBrl;
  useEffect(() => {
    if (liveRate && liveRate !== rate) setRate(liveRate);
  }, [liveRate, rate]);

  const activeCount = [minSavings, maxBrl, minRating].filter(Boolean).length;

  function reset() {
    setMinSavings(0);
    setMaxBrl(0);
    setMinRating(0);
    setStoreId("1");
    setPage(0);
  }

  const FilterPanel = (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ash">Loja</p>
        <select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value);
            setPage(0);
          }}
          className="w-full border border-line bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-magenta"
        >
          {(stores.data ?? [{ id: "1", name: "Steam" }]).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
          Desconto mínimo
        </p>
        <div className="flex flex-wrap gap-2">
          {SAVINGS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setMinSavings(v);
                setPage(0);
              }}
              className={`border px-3 py-1.5 font-mono text-xs transition-colors ${
                minSavings === v
                  ? "border-acid bg-acid text-ink"
                  : "border-line text-ash hover:border-acid hover:text-acid"
              }`}
            >
              {v === 0 ? "Qualquer" : `${v}%+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
          Preço máximo
        </p>
        <div className="flex flex-wrap gap-2">
          {PRICES_BRL.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setMaxBrl(v);
                setPage(0);
              }}
              className={`border px-3 py-1.5 font-mono text-xs transition-colors ${
                maxBrl === v
                  ? "border-magenta bg-magenta text-ink"
                  : "border-line text-ash hover:border-magenta hover:text-magenta"
              }`}
            >
              {v === 0 ? "Qualquer" : `até R$ ${v}`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
          Nota Steam mínima
        </p>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setMinRating(v);
                setPage(0);
              }}
              className={`border px-3 py-1.5 font-mono text-xs transition-colors ${
                minRating === v
                  ? "border-amber bg-amber text-ink"
                  : "border-line text-ash hover:border-amber hover:text-amber"
              }`}
            >
              {v === 0 ? "Qualquer" : `${v}%+`}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 self-start border border-line px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ash hover:border-danger hover:text-danger"
        >
          <X className="size-3" /> Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <section className="grid-lines border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
          <h1 className="display text-[clamp(3rem,8vw,7rem)]">
            {title ? (
              <>
                Busca: <span className="text-magenta">{title}</span>
              </>
            ) : (
              <>
                Todas as <span className="text-magenta">ofertas</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Dados ao vivo da CheapShark. Preços convertidos para real na cotação de hoje (US$ 1 ={" "}
            R$ {rate.toFixed(2)}) — a loja cobra em dólar.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] gap-10 px-5 py-10 md:px-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">{FilterPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpenFilters(true)}
              className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] lg:hidden"
            >
              <Filter className="size-3.5" /> Filtros
              {activeCount > 0 && (
                <span className="bg-magenta px-1.5 font-mono text-[10px] text-ink">
                  {activeCount}
                </span>
              )}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setSortBy(s.value);
                    setPage(0);
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    sortBy === s.value ? "bg-bone text-ink" : "text-ash hover:text-bone"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {deals.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <DealCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="border border-line bg-ink-2 p-14 text-center">
              <p className="display text-3xl">Nada por aqui</p>
              <p className="mt-2 text-sm text-ash">
                Afrouxe os filtros ou tente outro termo de busca.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((deal, i) => (
                <div key={deal.dealId} className="rise" style={{ animationDelay: `${i * 25}ms` }}>
                  <DealCard
                    deal={deal}
                    usdToBrl={rate}
                    saved={isSaved(deal.gameId)}
                    onToggleSave={toggleSave}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
            <button
              type="button"
              disabled={page === 0 || deals.isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] disabled:opacity-30 enabled:hover:border-magenta"
            >
              <ChevronLeft className="size-3.5" /> Anterior
            </button>
            <span className="font-mono text-sm text-ash">página {page + 1}</span>
            <button
              type="button"
              disabled={items.length < 24 || deals.isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] disabled:opacity-30 enabled:hover:border-magenta"
            >
              Próxima <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-[70] bg-ink/90 p-5 lg:hidden">
          <div className="mx-auto mt-10 max-w-md border border-line bg-ink-2 p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="display text-2xl">Filtros</p>
              <button type="button" onClick={() => setOpenFilters(false)}>
                <X className="size-5" />
              </button>
            </div>
            {FilterPanel}
            <button
              type="button"
              onClick={() => setOpenFilters(false)}
              className="mt-8 w-full bg-magenta py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
