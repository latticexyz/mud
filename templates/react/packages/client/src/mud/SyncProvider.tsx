import { createContext, ReactNode, useContext, useEffect } from "react";
import { useConfig } from "wagmi";
import { getClient } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { SyncAdapter, SyncResult } from "@latticexyz/store-sync";
import { Address } from "viem";

/** @internal */
export const SyncContext = createContext<{
  sync?: SyncResult;
} | null>(null);

export type Props = {
  chainId: number;
  address: Address;
  startBlock?: bigint;
  adapter: SyncAdapter;
  children: ReactNode;
};

export function SyncProvider({ chainId, address, startBlock, adapter, children }: Props) {
  const existingValue = useContext(SyncContext);
  if (existingValue != null) {
    throw new Error("A `SyncProvider` cannot be nested inside another.");
  }

  const config = useConfig();

  const { data: sync, error: syncError } = useQuery({
    queryKey: ["sync", chainId],
    queryFn: async () => {
      const client = getClient(config, { chainId });
      if (!client) {
        throw new Error(`Unable to retrieve Viem client for chain ${chainId}.`);
      }

      return adapter({ publicClient: client, address, startBlock });
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  if (syncError) throw syncError;

  useEffect(() => {
    if (!sync) return;

    const sub = sync.storedBlockLogs$.subscribe({
      error: (error) => console.error("got sync error", error),
    });

    return () => {
      sub.unsubscribe();
    };
  }, [sync]);

  return <SyncContext.Provider value={{ sync }}>{children}</SyncContext.Provider>;
}
