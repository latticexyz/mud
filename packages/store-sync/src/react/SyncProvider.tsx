import { ReactNode, createContext, useContext, useEffect } from "react";
import { useConfig } from "wagmi";
import { getClient } from "wagmi/actions";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { SyncAdapter, SyncOptions, SyncResult } from "../common";

/** @internal */
export const SyncContext = createContext<UseQueryResult<SyncResult> | null>(null);

export type Props = Omit<SyncOptions, "publicClient" | "internal_chain"> & {
  chainId: number;
  adapter: SyncAdapter;
  children: ReactNode;
};

export function SyncProvider({ chainId, adapter, children, ...syncOptions }: Props) {
  const existingValue = useContext(SyncContext);
  if (existingValue != null) {
    throw new Error("A `SyncProvider` cannot be nested inside another.");
  }

  const config = useConfig();

  const result = useQuery({
    queryKey: ["sync", chainId],
    queryFn: async () => {
      const client = getClient(config, { chainId });
      if (!client) {
        throw new Error(`Unable to retrieve Viem client for chain ${chainId}.`);
      }

      if (syncOptions.internal_validateBlockRange) {
        return await adapter({ ...syncOptions, internal_chain: client.chain });
      }

      return await adapter({ ...syncOptions, publicClient: client, internal_validateBlockRange: undefined });
    },
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
