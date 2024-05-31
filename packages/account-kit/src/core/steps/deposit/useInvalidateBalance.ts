import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useInvalidateBalance() {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await Promise.all([
      // invalidate balance queries
      // TODO: replace `useBalance` with our own `useQuery` so we can customize the query key
      queryClient.invalidateQueries({
        queryKey: ["balance"],
      }),
      // invalidate gas tank balance queries (via useRecord)
      // TODO: replace `useReadContract` in `useRecord` with our own `useQuery` so we can customize the query key
      queryClient.invalidateQueries({
        queryKey: ["readContract"],
      }),
    ]);
  }, [queryClient]);
}
