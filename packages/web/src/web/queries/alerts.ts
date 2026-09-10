import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useAlerts(enabled: boolean) {
  return useQuery(orpc.alerts.list.queryOptions({ enabled, staleTime: 60_000 }));
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.alerts.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.alerts.key() }),
    }),
  );
}

export function useRemoveAlert() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.alerts.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.alerts.key() }),
    }),
  );
}

export function useToggleAlert() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.alerts.toggle.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.alerts.key() }),
    }),
  );
}
