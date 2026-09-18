import { useQuery } from "@tanstack/react-query";
import { fetchBootstrap } from "@/lib/api";

export const BOOTSTRAP_QUERY_KEY = ["bootstrap"] as const;

export function useBootstrap() {
  return useQuery({
    queryKey: BOOTSTRAP_QUERY_KEY,
    queryFn: fetchBootstrap,
    refetchInterval: 30_000,
  });
}
