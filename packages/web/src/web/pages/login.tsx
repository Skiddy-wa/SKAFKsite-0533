import { useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Loader2, Tag } from "lucide-react";
import { Layout } from "../components/layout";
import { authClient } from "../lib/auth";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  async function google() {
    setError(null);
    setLoading("google");
    const result = await authClient.managedAuth.signIn({ provider: "google" });
    setLoading(null);
    if (result.error) {
      if (result.error.code !== "POPUP_CLOSED") {
        setError(result.error.message ?? "Não foi possível entrar com o Google.");
      }
      return;
    }
    navigate(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    const result =
      mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
    setLoading(null);
    if (result.error) {
      setError(result.error.message ?? "Verifique seus dados e tente de novo.");
      return;
    }
    navigate(next);
  }

  return (
    <Layout>
      <section className="grid-lines border-b border-line">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start px-5 py-12 md:px-10 md:py-16">
          <span className="flex items-center gap-2 border border-line px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-ash">
            <Tag className="size-3 text-magenta" /> Skafk promoções
          </span>
          <h1 className="display mt-5 text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9]">
            {mode === "signin" ? (
              <>
                Bem-vindo <span className="text-magenta">de volta</span>
              </>
            ) : (
              <>
                Crie sua <span className="text-magenta">conta</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ash">
            Entre para salvar jogos na wishlist e receber alertas por email quando o preço cair.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
        <div className="mx-auto w-full max-w-md border border-line bg-ink-2 p-7">
          <div className="flex border border-line">
            {(
              [
                ["signin", "Entrar"],
                ["signup", "Criar conta"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className={`flex-1 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors ${
                  mode === value ? "bg-magenta text-ink" : "text-ash hover:text-bone"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={google}
            disabled={loading !== null}
            className="mt-6 flex w-full items-center justify-center gap-3 border border-line bg-ink-3 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-bone transition-colors hover:border-magenta disabled:opacity-50"
          >
            {loading === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.8-6.8C35.6 2.3 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.1 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.5c-.3 2.1-1.6 5.2-4.6 7.3l7.7 6c4.5-4.2 6.5-10.2 6.5-17.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.9-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.2 0 11.5-2 15.6-5.9l-7.7-6c-2.1 1.4-4.8 2.4-7.9 2.4-6.3 0-11.6-3.6-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
            )}
            Continuar com Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-ash">ou</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-ash">Nome</span>
                <input
                  aria-label="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como te chamamos?"
                  className="mt-2 w-full border border-line bg-ink px-4 py-3 text-sm text-bone outline-none placeholder:text-ash/60 focus:border-magenta"
                />
              </label>
            )}
            <label className="block">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-ash">Email</span>
              <input
                type="email"
                aria-label="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="mt-2 w-full border border-line bg-ink px-4 py-3 text-sm text-bone outline-none placeholder:text-ash/60 focus:border-magenta"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-ash">Senha</span>
              <input
                type="password"
                aria-label="Senha"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 8 caracteres"
                className="mt-2 w-full border border-line bg-ink px-4 py-3 text-sm text-bone outline-none placeholder:text-ash/60 focus:border-magenta"
              />
            </label>

            {error && (
              <p className="border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading !== null}
              className="flex w-full items-center justify-center gap-2 bg-acid px-4 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading === "email" && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-[11px] leading-relaxed text-ash">
            Usamos seu email só para login e alertas de preço. Nada de spam.
          </p>
        </div>
      </div>
    </Layout>
  );
}
