import { Stash } from "@latticexyz/stash/internal";
import { syncToStash, SyncToStashResult } from "@latticexyz/store-sync/internal";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useClient } from "wagmi";
import { chainId } from "../common";
import { Address, publicActions, PublicClient } from "viem";
import { useQuery } from "@tanstack/react-query";

/** @internal */
export const StashSyncContext = createContext<{
  sync?: SyncToStashResult;
} | null>(null);

export type Props = {
  address: Address;
  startBlock?: bigint;
  stash: Stash;
  children: ReactNode;
};

export function StashSyncProvider({ address, startBlock, stash, children }: Props) {
  const existingValue = useContext(StashSyncContext);
  if (existingValue != null) {
    throw new Error("A `StashSyncProvider` cannot be nested inside another.");
  }

  const client = useClient({ chainId });
  if (!client) {
    throw new Error(`Unable to retrieve Viem client for chain ${chainId}.`);
  }

  const { data: sync, error: syncError } = useQuery({
    queryKey: ["syncToStash", client.chain.id, address, startBlock?.toString()],
    queryFn: () =>
      // TODO: clear stash
      syncToStash({
        stash,
        publicClient: client.extend(publicActions) as PublicClient,
        address,
        startBlock,
      }),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  if (syncError) throw syncError;

  useEffect(() => {
    const sub = sync?.storedBlockLogs$.subscribe({
      error: (error) => console.error("got sync error", error),
    });

    return () => {
      sync?.stopSync();
      sub?.unsubscribe();
    };
  }, [sync]);

  return <StashSyncContext.Provider value={{ sync }}>{children}</StashSyncContext.Provider>;
}
