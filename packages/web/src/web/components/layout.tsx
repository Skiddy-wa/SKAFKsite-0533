import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise min-h-screen bg-ink">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
