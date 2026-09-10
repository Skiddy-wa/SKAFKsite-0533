import { Link } from "wouter";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { Layout } from "../components/layout";
import { authClient } from "../lib/auth";
import { useAlerts, useRemoveAlert, useToggleAlert } from "../queries/alerts";
import { brl, usd } from "../lib/format";

export default function AlertsPage() {
  const { data: session, isPending } = authClient.useSession();
  const alerts = useAlerts(Boolean(session));
  const remove = useRemoveAlert();
  const toggle = useToggleAlert();
  const items = alerts.data?.items ?? [];
  const rate = alerts.data?.usdToBrl ?? 5.4;

  return (
    <Layout>
      <section className="grid-lines border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
          <h1 className="display text-[clamp(3rem,8vw,7rem)]">
            Alertas de <span className="text-acid">preço</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Definimos vigia no jogo: quando qualquer loja bater o seu preço-alvo, chega um email com
            o link direto. Crie alertas na página de cada jogo.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
        {isPending ? (
          <div className="skeleton h-32 w-full" />
        ) : !session ? (
          <div className="border border-line bg-ink-2 p-14 text-center">
            <Bell className="mx-auto size-8 text-acid" />
            <p className="display mt-4 text-3xl">Entre para criar alertas</p>
            <Link
              to="/entrar?next=/alertas"
              className="mt-6 inline-block bg-magenta px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink"
            >
              Entrar
            </Link>
          </div>
        ) : alerts.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-line bg-ink-2 p-14 text-center">
            <p className="display text-3xl">Nenhum alerta ainda</p>
            <p className="mt-2 text-sm text-ash">
              Abra um jogo e use o painel "Alerta de preço" para começar a vigiar.
            </p>
            <Link
              to="/ofertas"
              className="mt-6 inline-block border border-line px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] hover:border-acid hover:text-acid"
            >
              Escolher um jogo
            </Link>
          </div>
        ) : (
          <div className="border border-line">
            {items.map((alert) => {
              const hit =
                alert.currentPrice !== null && alert.currentPrice <= alert.targetPrice;
              return (
                <div
                  key={alert.id}
                  className="flex flex-wrap items-center gap-4 border-b border-line p-4 last:border-0 hover:bg-ink-2"
                >
                  {alert.thumb && (
                    <Link to={`/jogo/${alert.gameId}`} className="shrink-0">
                      <img
                        src={alert.thumb}
                        alt=""
                        loading="lazy"
                        className="h-14 w-[120px] object-cover"
                      />
                    </Link>
                  )}
                  <Link to={`/jogo/${alert.gameId}`} className="min-w-[160px] flex-1">
                    <p className="display text-xl">{alert.title}</p>
                    <p className="text-[11px] uppercase tracking-widest text-ash">
                      alvo {brl(alert.targetPrice, rate)} · email {alert.email}
                    </p>
                  </Link>

                  <div className="text-right">
                    <p
                      className={`font-mono text-lg font-extrabold ${
                        hit ? "text-acid" : "text-bone"
                      }`}
                    >
                      {alert.currentPrice !== null ? brl(alert.currentPrice, rate) : "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-ash">
                      {alert.currentPrice !== null && `${usd(alert.currentPrice)} · `}
                      {hit ? "bateu o alvo" : "acima do alvo"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle.mutate({ id: alert.id, active: !alert.active })}
                    disabled={toggle.isPending}
                    aria-label={alert.active ? "Pausar alerta" : "Ativar alerta"}
                    className={`border p-2.5 transition-colors disabled:opacity-50 ${
                      alert.active
                        ? "border-acid text-acid"
                        : "border-line text-ash hover:border-acid hover:text-acid"
                    }`}
                  >
                    {alert.active ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate({ id: alert.id })}
                    disabled={remove.isPending}
                    aria-label="Remover alerta"
                    className="border border-line p-2.5 text-ash transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
