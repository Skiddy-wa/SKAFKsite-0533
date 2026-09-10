import { useLocation } from "wouter";
import { authClient } from "../lib/auth";
import { useToggleWishlist, useWishlistIds } from "../queries/wishlist";
import type { DealItem } from "../components/deal-card";

/** Estado da wishlist + toggle otimista; manda para o login quando não há sessão. */
export function useSavedGames() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const ids = useWishlistIds(Boolean(session));
  const toggle = useToggleWishlist();

  const savedIds = new Set(ids.data ?? []);

  function toggleSave(deal: Pick<DealItem, "gameId" | "title" | "thumb" | "steamAppId">) {
    if (!session) {
      navigate("/entrar?next=/wishlist");
      return;
    }
    toggle.mutate({
      gameId: deal.gameId,
      title: deal.title,
      thumb: deal.thumb,
      steamAppId: deal.steamAppId,
    });
  }

  return { session, savedIds, toggleSave, isSaved: (id: string) => savedIds.has(id) };
}
