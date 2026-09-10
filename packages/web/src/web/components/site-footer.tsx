import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-2">
      <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-5xl md:text-7xl">
              Nunca mais
              <br />
              pague <span className="text-magenta">preço cheio</span>
            </p>
            <p className="mt-4 max-w-md text-sm text-ash">
              Preços puxados ao vivo da CheapShark e da Steam. Cotação USD→BRL apenas como
              estimativa — o valor final é o da loja.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
                Navegar
              </span>
              <Link to="/ofertas" className="hover:text-magenta">
                Ofertas
              </Link>
              <Link to="/wishlist" className="hover:text-magenta">
                Wishlist
              </Link>
              <Link to="/alertas" className="hover:text-magenta">
                Alertas
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
                Fontes
              </span>
              <a
                href="https://www.cheapshark.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-magenta"
              >
                CheapShark
              </a>
              <a
                href="https://store.steampowered.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-magenta"
              >
                Steam
              </a>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-line pt-6 text-[11px] uppercase tracking-[0.25em] text-ash">
          Skafk Promoções — não afiliado à Valve. Steam é marca da Valve Corporation.
        </p>
      </div>
    </footer>
  );
}
