import { Link, Route, Switch } from "wouter";
import Index from "./pages/index";
import DealsPage from "./pages/deals";
import GamePage from "./pages/game";
import WishlistPage from "./pages/wishlist";
import AlertsPage from "./pages/alerts";
import LoginPage from "./pages/login";
import { Layout } from "./components/layout";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function NotFound() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-[1440px] flex-col items-start px-5 py-24 md:px-10">
        <p className="display text-[clamp(4rem,14vw,11rem)] leading-[0.85] text-magenta">404</p>
        <p className="display mt-4 text-3xl">Essa página não está em promoção</p>
        <p className="mt-3 text-sm text-ash">O link não existe (ou a oferta já acabou).</p>
        <Link
          to="/ofertas"
          className="mt-8 bg-acid px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink"
        >
          Ver ofertas
        </Link>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/ofertas" component={DealsPage} />
        <Route path="/jogo/:id" component={GamePage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/alertas" component={AlertsPage} />
        <Route path="/entrar" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
