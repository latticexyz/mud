import { ReactNode, createContext, useContext, useEffect } from "react";
import { useChains } from "wagmi";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { SyncAdapter, SyncOptions, SyncResult } from "../common";

/** @internal */
export const SyncContext = createContext<UseQueryResult<SyncResult> | null>(null);

export type Props = Omit<SyncOptions, "publicClient" | "chain"> & {
  chainId: number;
  adapter: SyncAdapter;
  children: ReactNode;
};

export function SyncProvider({ chainId, adapter, children, ...syncOptions }: Props) {
  const existingValue = useContext(SyncContext);
  if (existingValue != null) {
    throw new Error("A `SyncProvider` cannot be nested inside another.");
  }

  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`No chain configured for chain ID ${chainId}.`);
  }

  const result = useQuery({
    queryKey: ["sync", chainId],
    queryFn: () => adapter({ chain, ...syncOptions }),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!result.data) return;

    const sub = result.data.storedBlockLogs$.subscribe({
      error: (error) => console.error("got sync error", error),
    });
    return (): void => {
      sub.unsubscribe();
    };
  }, [result.data]);

  return <SyncContext.Provider value={result}>{children}</SyncContext.Provider>;
}
