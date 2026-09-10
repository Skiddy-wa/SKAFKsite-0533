import { Link } from "wouter";
import { Heart, Trash2 } from "lucide-react";
import { Layout } from "../components/layout";
import { authClient } from "../lib/auth";
import { useRemoveWishlist, useWishlist } from "../queries/wishlist";
import { brl, pct, usd } from "../lib/format";

export default function WishlistPage() {
  const { data: session, isPending } = authClient.useSession();
  const wishlist = useWishlist(Boolean(session));
  const remove = useRemoveWishlist();

  return (
    <Layout>
      <section className="grid-lines border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
          <h1 className="display text-[clamp(3rem,8vw,7rem)]">
            Sua <span className="text-magenta">wishlist</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Os jogos que você salvou, com o menor preço atual entre todas as lojas.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
        {isPending ? (
          <div className="skeleton h-32 w-full" />
        ) : !session ? (
          <div className="border border-line bg-ink-2 p-14 text-center">
            <Heart className="mx-auto size-8 text-magenta" />
            <p className="display mt-4 text-3xl">Entre para salvar jogos</p>
            <Link
              to="/entrar?next=/wishlist"
              className="mt-6 inline-block bg-magenta px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink"
            >
              Entrar
            </Link>
          </div>
        ) : wishlist.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : !wishlist.data?.items.length ? (
          <div className="border border-line bg-ink-2 p-14 text-center">
            <p className="display text-3xl">Wishlist vazia</p>
            <p className="mt-2 text-sm text-ash">
              Salve jogos pelo coração nos cards de oferta.
            </p>
            <Link
              to="/ofertas"
              className="mt-6 inline-block border border-line px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] hover:border-magenta hover:text-magenta"
            >
              Explorar ofertas
            </Link>
          </div>
        ) : (
          <div className="border border-line">
            {wishlist.data.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 border-b border-line p-4 last:border-0 hover:bg-ink-2"
              >
                {item.thumb && (
                  <Link to={`/jogo/${item.gameId}`} className="shrink-0">
                    <img
                      src={item.thumb}
                      alt=""
                      loading="lazy"
                      className="h-14 w-[120px] object-cover"
                    />
                  </Link>
                )}
                <Link to={`/jogo/${item.gameId}`} className="min-w-[160px] flex-1">
                  <p className="display text-xl">{item.title}</p>
                  {item.cheapestEver ? (
                    <p className="font-mono text-[11px] text-ash">
                      menor histórico: {brl(item.cheapestEver, wishlist.data.usdToBrl)}
                    </p>
                  ) : null}
                </Link>

                <div className="text-right">
                  {item.bestPrice !== null ? (
                    <>
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="font-mono text-xl font-extrabold text-acid">
                          {brl(item.bestPrice, wishlist.data.usdToBrl)}
                        </span>
                        {item.savings > 0 && (
                          <span className="bg-acid px-1.5 font-mono text-[11px] font-extrabold text-ink">
                            {pct(item.savings)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-ash">
                        {usd(item.bestPrice)} na loja
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-ash">sem oferta</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove.mutate({ id: item.id })}
                  disabled={remove.isPending}
                  aria-label="Remover"
                  className="border border-line p-2.5 text-ash transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
