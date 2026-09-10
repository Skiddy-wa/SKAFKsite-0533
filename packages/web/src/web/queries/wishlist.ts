import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useWishlist(enabled: boolean) {
  return useQuery(orpc.wishlist.list.queryOptions({ enabled, staleTime: 60_000 }));
}

export function useWishlistIds(enabled: boolean) {
  return useQuery(orpc.wishlist.ids.queryOptions({ enabled, staleTime: 60_000 }));
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const idsKey = orpc.wishlist.ids.queryOptions().queryKey;
  return useMutation(
    orpc.wishlist.toggle.mutationOptions({
      onMutate: async ({ gameId }: { gameId: string }) => {
        await queryClient.cancelQueries({ queryKey: idsKey });
        const prev = queryClient.getQueryData<string[]>(idsKey);
        queryClient.setQueryData<string[]>(idsKey, (old) =>
          old?.includes(gameId)
            ? old.filter((id) => id !== gameId)
            : [...(old ?? []), gameId],
        );
        return { prev };
      },
      onError: (_e, _v, ctx) => queryClient.setQueryData(idsKey, ctx?.prev),
      onSettled: () => queryClient.invalidateQueries({ queryKey: orpc.wishlist.key() }),
    }),
  );
}

export function useRemoveWishlist() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.wishlist.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.wishlist.key() }),
    }),
  );
}
