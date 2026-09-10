import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Heart, LogOut, Menu, Search, X } from "lucide-react";
import { authClient } from "../lib/auth";
import { useGameSearch } from "../queries/deals";
import { brl, steamHeader } from "../lib/format";

const NAV = [
  { href: "/ofertas", label: "Ofertas" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/alertas", label: "Alertas" },
];

export function SiteHeader() {
  const [location, navigate] = useLocation();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { data: session } = authClient.useSession();
  const search = useGameSearch(term);
  const searchItems = search.data?.items ?? [];
  const searchRate = search.data?.usdToBrl ?? 5.4;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    navigate(`/ofertas?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-3 md:px-10">
        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <span className="display text-2xl leading-none md:text-3xl">SKAFK</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.35em] text-magenta sm:block">
            Promoções
          </span>
        </Link>

        <form onSubmit={submit} className="relative ml-auto hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ash" />
          <input
            aria-label="Buscar jogo"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar jogo..."
            className="w-full border border-line bg-ink-2 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-ash focus:border-magenta"
          />
          {open && term.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-[380px] overflow-auto border border-line bg-ink-2 shadow-2xl">
              {search.isLoading && <p className="p-3 text-xs text-ash">Buscando...</p>}
              {!search.isLoading && searchItems.length === 0 && (
                <p className="p-3 text-xs text-ash">Nada encontrado em promoção.</p>
              )}
              {searchItems.map((deal) => (
                <Link
                  key={deal.dealId}
                  to={`/jogo/${deal.gameId}`}
                  className="flex items-center gap-3 border-b border-line p-2 last:border-0 hover:bg-ink-3"
                >
                  <img
                    src={steamHeader(deal.steamAppId, deal.thumb)}
                    alt=""
                    loading="lazy"
                    className="h-10 w-[76px] shrink-0 object-cover"
                  />
                  <span className="line-clamp-1 flex-1 text-xs font-semibold">{deal.title}</span>
                  <span className="font-mono text-xs text-acid">
                    {brl(deal.salePrice, searchRate)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <nav className="ml-auto hidden items-center gap-6 md:ml-0 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-magenta ${
                location === item.href ? "text-magenta" : "text-bone"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {session ? (
            <button
              type="button"
              onClick={() => authClient.signOut()}
              className="flex items-center gap-2 border border-line px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:border-magenta hover:text-magenta"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          ) : (
            <Link
              to="/entrar"
              className="bg-magenta px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-ink transition-transform hover:-translate-y-0.5"
            >
              Entrar
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="ml-auto md:hidden"
          aria-label="Menu"
        >
          {menu ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {menu && (
        <div className="border-t border-line bg-ink-2 px-5 py-4 md:hidden">
          <form onSubmit={submit} className="mb-4 flex gap-2">
            <input
              aria-label="Buscar jogo"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar jogo..."
              className="w-full border border-line bg-ink py-2.5 px-3 text-sm outline-none focus:border-magenta"
            />
            <button type="submit" className="bg-magenta px-4 text-ink">
              <Search className="size-4" />
            </button>
          </form>
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenu(false)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]"
              >
                {item.href === "/wishlist" && <Heart className="size-4 text-magenta" />}
                {item.href === "/alertas" && <Bell className="size-4 text-magenta" />}
                {item.label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={() => authClient.signOut()}
                className="text-left text-sm font-bold uppercase tracking-[0.18em] text-ash"
              >
                Sair
              </button>
            ) : (
              <Link
                to="/entrar"
                onClick={() => setMenu(false)}
                className="bg-magenta px-4 py-2 text-center text-sm font-extrabold uppercase tracking-[0.18em] text-ink"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
