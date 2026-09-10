import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Bell, Check, ExternalLink, Heart, Monitor, Trophy } from "lucide-react";
import { Layout } from "../components/layout";
import { useGameDetail } from "../queries/deals";
import { useSavedGames } from "../hooks/use-saved-games";
import { useCreateAlert } from "../queries/alerts";
import { brl, pct, steamHeader, timeAgo, usd } from "../lib/format";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const game = useGameDetail(id);
  const { session, isSaved, toggleSave } = useSavedGames();
  const createAlert = useCreateAlert();
  const [target, setTarget] = useState("");
  const [shot, setShot] = useState(0);

  if (game.isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10">
          <div className="skeleton h-72 w-full" />
          <div className="skeleton mt-6 h-12 w-1/2" />
          <div className="skeleton mt-4 h-4 w-1/3" />
        </div>
      </Layout>
    );
  }

  if (game.isError || !game.data) {
    return (
      <Layout>
        <div className="mx-auto max-w-[1440px] px-5 py-24 text-center md:px-10">
          <p className="display text-5xl">Jogo não encontrado</p>
          <Link to="/ofertas" className="mt-6 inline-block text-magenta underline">
            Voltar para as ofertas
          </Link>
        </div>
      </Layout>
    );
  }

  const g = game.data;
  const best = g.offers[0];
  const saved = isSaved(g.gameId);
  const rate = g.usdToBrl;
  const screenshots = g.steam?.screenshots ?? [];
  const heroImage = g.steam?.background ?? steamHeader(g.steamAppId, g.thumb);

  function submitAlert(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(target.replace(",", "."));
    if (!value || value <= 0) return;
    createAlert.mutate({
      gameId: g.gameId,
      title: g.title,
      thumb: steamHeader(g.steamAppId, g.thumb),
      // o alvo é digitado em real; guardamos em dólar (moeda das lojas)
      targetPrice: Number((value / rate).toFixed(2)),
    });
  }

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
          <Link
            to="/ofertas"
            className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ash hover:text-magenta"
          >
            <ArrowLeft className="size-3.5" /> Ofertas
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="display text-[clamp(2.6rem,7vw,6rem)]">{g.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest text-ash">
                {g.steam?.releaseDate && <span>{g.steam.releaseDate}</span>}
                {g.steam?.developers?.[0] && <span>· {g.steam.developers[0]}</span>}
                {g.steam?.metacritic && (
                  <span className="flex items-center gap-1 text-amber">
                    <Trophy className="size-3" /> {g.steam.metacritic}
                  </span>
                )}
              </div>
              {g.steam?.genres?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {g.steam.genres.map((genre) => (
                    <span key={genre} className="border border-line px-2.5 py-1 text-[11px] text-ash">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}
              {g.steam?.description && (
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ash md:text-base">
                  {g.steam.description}
                </p>
              )}
            </div>

            {/* MELHOR PREÇO */}
            <div className="border border-line bg-ink-2 p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
                Melhor preço agora
              </p>
              {best ? (
                <>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="font-mono text-4xl font-extrabold text-acid">
                      {brl(best.price, rate)}
                    </span>
                    {best.savings > 0 && (
                      <span className="bg-acid px-2 py-0.5 font-mono text-sm font-extrabold text-ink">
                        {pct(best.savings)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-ash">
                    {usd(best.price)} · na {best.storeName}
                  </p>
                  <a
                    href={best.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 bg-acid py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5"
                  >
                    Pegar na {best.storeName} <ExternalLink className="size-3.5" />
                  </a>
                </>
              ) : (
                <p className="mt-3 text-sm text-ash">Sem oferta ativa no momento.</p>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span className="text-ash">Menor preço histórico</span>
                <span className="font-mono text-bone">
                  {g.cheapestEver.price ? brl(g.cheapestEver.price, rate) : "—"}
                  {g.cheapestEver.date ? (
                    <span className="ml-2 text-ash">{timeAgo(g.cheapestEver.date)}</span>
                  ) : null}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  toggleSave({
                    gameId: g.gameId,
                    title: g.title,
                    thumb: steamHeader(g.steamAppId, g.thumb),
                    steamAppId: g.steamAppId,
                  })
                }
                className={`mt-4 flex w-full items-center justify-center gap-2 border py-3 text-xs font-extrabold uppercase tracking-[0.2em] transition-colors ${
                  saved ? "border-magenta text-magenta" : "border-line hover:border-magenta"
                }`}
              >
                <Heart className={`size-4 ${saved ? "fill-magenta" : ""}`} />
                {saved ? "Na wishlist" : "Salvar na wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {screenshots.length > 0 && (
            <section className="mb-14">
              <h2 className="display mb-5 text-3xl md:text-4xl">Screenshots</h2>
              <img
                src={screenshots[shot]}
                alt=""
                className="aspect-video w-full border border-line object-cover"
              />
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {screenshots.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={`Ver screenshot ${i + 1}`}
                    onClick={() => setShot(i)}
                    className={`shrink-0 border transition-colors ${
                      i === shot ? "border-magenta" : "border-line hover:border-ash"
                    }`}
                  >
                    <img src={s} alt="" loading="lazy" className="h-16 w-28 object-cover" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="display mb-5 text-3xl md:text-4xl">
              Preço em <span className="text-magenta">todas as lojas</span>
            </h2>
            <div className="border border-line">
              {g.offers.map((offer, i) => (
                <div
                  key={offer.dealId}
                  className={`flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0 ${
                    i === 0 ? "bg-acid/5" : ""
                  }`}
                >
                  {offer.storeIcon && (
                    <img src={offer.storeIcon} alt="" className="size-5 shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-semibold">
                    {offer.storeName}
                    {i === 0 && (
                      <span className="ml-2 font-mono text-[10px] uppercase text-acid">
                        melhor preço
                      </span>
                    )}
                  </span>
                  {offer.savings > 0 && (
                    <span className="hidden font-mono text-xs text-acid sm:block">
                      {pct(offer.savings)}
                    </span>
                  )}
                  <div className="text-right">
                    <p className={`font-mono text-sm ${i === 0 ? "text-acid" : "text-bone"}`}>
                      {brl(offer.price, rate)}
                    </p>
                    <p className="font-mono text-[10px] text-ash">{usd(offer.price)}</p>
                  </div>
                  <a
                    href={offer.link}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-line px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] hover:border-acid hover:text-acid"
                  >
                    Ir
                  </a>
                </div>
              ))}
              {g.offers.length === 0 && (
                <p className="p-6 text-sm text-ash">Nenhuma loja com esse jogo agora.</p>
              )}
            </div>
          </section>
        </div>

        {/* ALERTA */}
        <aside>
          <div className="sticky top-24 border border-line bg-ink-2 p-6">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-magenta">
              <Bell className="size-3" /> Alerta de preço
            </p>
            <h3 className="display mt-3 text-2xl">Me avisa quando cair</h3>

            {session ? (
              <form onSubmit={submitAlert} className="mt-5">
                <label htmlFor="target-price" className="text-[11px] uppercase tracking-widest text-ash">
                  Preço-alvo (R$)
                </label>
                <input
                  id="target-price"
                  aria-label="Preço-alvo em reais"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  inputMode="decimal"
                  placeholder={best ? (best.price * rate * 0.7).toFixed(2) : "49,90"}
                  className="mt-2 w-full border border-line bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-magenta"
                />
                <button
                  type="submit"
                  disabled={createAlert.isPending}
                  className="mt-4 flex w-full items-center justify-center gap-2 bg-magenta py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink disabled:opacity-60"
                >
                  {createAlert.isPending ? "Criando..." : "Criar alerta"}
                </button>
                {createAlert.isSuccess && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-acid">
                    <Check className="size-3.5" /> Alerta ativo. Avisamos por email.
                  </p>
                )}
                {createAlert.isError && (
                  <p className="mt-3 text-xs text-danger">Não rolou. Tenta de novo.</p>
                )}
              </form>
            ) : (
              <>
                <p className="mt-3 text-sm text-ash">
                  Entre para receber um email quando o preço bater o valor que você definir.
                </p>
                <Link
                  to={`/entrar?next=/jogo/${g.gameId}`}
                  className="mt-5 block bg-magenta py-3 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-ink"
                >
                  Entrar
                </Link>
              </>
            )}

            {g.steam && (
              <div className="mt-6 border-t border-line pt-5">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
                  <Monitor className="size-3" /> Plataformas
                </p>
                <div className="flex gap-2 text-xs">
                  {[
                    ["Windows", g.steam.windows],
                    ["macOS", g.steam.mac],
                    ["Linux", g.steam.linux],
                  ]
                    .filter(([, ok]) => ok)
                    .map(([name]) => (
                      <span key={String(name)} className="border border-line px-2.5 py-1">
                        {name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {g.steamAppId && (
              <a
                href={`https://store.steampowered.com/app/${g.steamAppId}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center gap-2 text-xs text-ash hover:text-bone"
              >
                Ver na Steam <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </aside>
      </div>
    </Layout>
  );
}
