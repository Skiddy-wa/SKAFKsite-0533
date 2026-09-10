import { Link } from "wouter";
import { ArrowRight, Flame, Sparkles, Timer, TrendingDown } from "lucide-react";
import { Layout } from "../components/layout";
import { DealCard, DealCardSkeleton, type DealItem } from "../components/deal-card";
import { useFeaturedDeals } from "../queries/deals";
import { useSavedGames } from "../hooks/use-saved-games";
import { brl, pct, steamHeader, usd } from "../lib/format";

function Marquee() {
  const words = ["DESCONTO REAL", "PREÇO AO VIVO", "STEAM", "GOG", "EPIC", "FANATICAL", "HISTÓRICO DE PREÇO"];
  return (
    <div className="overflow-hidden border-y border-line bg-magenta py-2.5">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {words.map((w) => (
              <span
                key={`${dup}-${w}`}
                className="display px-6 text-lg text-ink md:text-xl"
              >
                {w} <span className="px-3 opacity-40">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-magenta">
          {icon}
          {subtitle}
        </span>
        <h2 className="display mt-2 text-4xl md:text-6xl">{title}</h2>
      </div>
      <Link
        to={href}
        className="flex items-center gap-2 border border-line px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors hover:border-magenta hover:text-magenta"
      >
        Ver tudo <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Row({
  items,
  usdToBrl,
  loading,
  isSaved,
  onToggle,
}: {
  items: DealItem[];
  usdToBrl: number;
  loading: boolean;
  isSaved: (id: string) => boolean;
  onToggle: (d: DealItem) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.slice(0, 8).map((deal, i) => (
        <div key={deal.dealId} className="rise" style={{ animationDelay: `${i * 45}ms` }}>
          <DealCard
            deal={deal}
            usdToBrl={usdToBrl}
            saved={isSaved(deal.gameId)}
            onToggleSave={onToggle}
          />
        </div>
      ))}
    </div>
  );
}

export default function IndexPage() {
  const featured = useFeaturedDeals();
  const { isSaved, toggleSave } = useSavedGames();
  const data = featured.data;
  const rate = data?.usdToBrl ?? 5.4;
  const hero = data?.dealOfTheDay;

  const totalDeals =
    (data?.top.length ?? 0) +
    (data?.biggest.length ?? 0) +
    (data?.cheap.length ?? 0) +
    (data?.rated.length ?? 0) +
    (hero ? 1 : 0);

  return (
    <Layout>
      {/* HERO */}
      <section className="grid-lines relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-magenta/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-0 size-[380px] rounded-full bg-acid/10 blur-[120px]" />

        <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-14 md:px-10 md:pb-24 md:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="rise">
              <span className="inline-flex items-center gap-2 border border-magenta px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-magenta">
                <Flame className="size-3" /> Ofertas ao vivo
              </span>
              <h1 className="display mt-6 text-[clamp(3.5rem,11vw,10rem)]">
                Caça às
                <br />
                <span className="text-magenta">ofertas</span> da
                <br />
                Steam
              </h1>
              <p className="mt-6 max-w-lg text-base text-ash md:text-lg">
                Preço real, desconto real, sem enrolação. Puxamos as promoções direto da CheapShark
                e da Steam, comparamos com {""}
                <span className="text-bone">todas as outras lojas</span> e avisamos por email quando
                o jogo bate o preço que você quer.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/ofertas"
                  className="bg-magenta px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5"
                >
                  Ver todas as ofertas
                </Link>
                <Link
                  to="/alertas"
                  className="border border-line px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] transition-colors hover:border-acid hover:text-acid"
                >
                  Criar alerta de preço
                </Link>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-px border border-line bg-line">
                {[
                  { k: `${totalDeals || "—"}`, v: "ofertas na vitrine" },
                  { k: `${data?.biggest.length ? "75%+" : "—"}`, v: "descontos monstro" },
                  { k: rate ? `R$ ${rate.toFixed(2)}` : "—", v: "dólar hoje" },
                ].map((s) => (
                  <div key={s.v} className="bg-ink px-4 py-4">
                    <p className="font-mono text-2xl font-extrabold text-acid">{s.k}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ash">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OFERTA DO DIA */}
            <div className="rise" style={{ animationDelay: "120ms" }}>
              <span className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-acid">
                <Timer className="size-3" /> Oferta do dia
              </span>
              {featured.isLoading || !hero ? (
                <div className="border border-line bg-ink-2">
                  <div className="skeleton aspect-[460/215] w-full" />
                  <div className="space-y-3 p-5">
                    <div className="skeleton h-8 w-2/3" />
                    <div className="skeleton h-4 w-1/3" />
                  </div>
                </div>
              ) : (
                <article className="group border border-line bg-ink-2">
                  <Link to={`/jogo/${hero.gameId}`} className="block overflow-hidden">
                    <img
                      src={steamHeader(hero.steamAppId, hero.thumb)}
                      alt={hero.title}
                      className="aspect-[460/215] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="bg-acid px-2 py-0.5 font-mono text-sm font-extrabold text-ink">
                        {pct(hero.savings)}
                      </span>
                      {hero.steamRatingText && (
                        <span className="text-[11px] uppercase tracking-widest text-ash">
                          {hero.steamRatingText} · {hero.steamRatingPercent}%
                        </span>
                      )}
                    </div>
                    <h3 className="display mt-3 text-3xl md:text-4xl">{hero.title}</h3>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-3xl font-extrabold text-acid">
                            {brl(hero.salePrice, rate)}
                          </span>
                          <span className="font-mono text-sm text-ash line-through">
                            {brl(hero.normalPrice, rate)}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-ash">
                          {usd(hero.salePrice)} na loja
                        </span>
                      </div>
                      <a
                        href={hero.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-bone px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5"
                      >
                        Pegar agora
                      </a>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <SectionTitle
          icon={<Flame className="size-3" />}
          subtitle="Melhores negócios agora"
          title="Top ofertas"
          href="/ofertas"
        />
        <Row
          items={(data?.top ?? []) as DealItem[]}
          usdToBrl={rate}
          loading={featured.isLoading}
          isSaved={isSaved}
          onToggle={toggleSave}
        />

        <div className="mt-20">
          <SectionTitle
            icon={<TrendingDown className="size-3" />}
            subtitle="75% ou mais de desconto"
            title="Descontos monstro"
            href="/ofertas?minSavings=75"
          />
          <Row
            items={(data?.biggest ?? []) as DealItem[]}
            usdToBrl={rate}
            loading={featured.isLoading}
            isSaved={isSaved}
            onToggle={toggleSave}
          />
        </div>

        <div className="mt-20">
          <SectionTitle
            icon={<Sparkles className="size-3" />}
            subtitle="Abaixo de R$ 30"
            title="Troco de café"
            href="/ofertas?maxBrl=30"
          />
          <Row
            items={(data?.cheap ?? []) as DealItem[]}
            usdToBrl={rate}
            loading={featured.isLoading}
            isSaved={isSaved}
            onToggle={toggleSave}
          />
        </div>

        <div className="mt-20">
          <SectionTitle
            icon={<Sparkles className="size-3" />}
            subtitle="Nota alta na Steam"
            title="Bem avaliados"
            href="/ofertas?minRating=80"
          />
          <Row
            items={(data?.rated ?? []) as DealItem[]}
            usdToBrl={rate}
            loading={featured.isLoading}
            isSaved={isSaved}
            onToggle={toggleSave}
          />
        </div>
      </div>

      {/* CTA ALERTA */}
      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:px-10 md:py-24">
          <div>
            <h2 className="display text-5xl md:text-7xl">
              Deixa que a gente
              <br />
              <span className="text-acid">vigia o preço</span>
            </h2>
            <p className="mt-5 max-w-md text-ash">
              Escolhe o jogo, define o preço-alvo e some. Quando qualquer loja bater esse valor, cai
              um email no seu inbox com o link direto da oferta.
            </p>
          </div>
          <div className="flex flex-col gap-3 border border-line bg-ink p-8">
            {["Salve jogos na wishlist", "Defina o preço que você aceita pagar", "Receba o email e compre"].map(
              (step, i) => (
                <div key={step} className="flex items-center gap-4 border-b border-line py-3 last:border-0">
                  <span className="font-mono text-2xl font-extrabold text-magenta">0{i + 1}</span>
                  <span className="text-sm">{step}</span>
                </div>
              ),
            )}
            <Link
              to="/alertas"
              className="mt-4 bg-acid px-6 py-3.5 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5"
            >
              Criar meu alerta
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
