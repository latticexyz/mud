import { ReactNode, createContext, useContext, useEffect } from "react";
import { useConfig } from "wagmi";
import { getClient } from "wagmi/actions";
import { useQuery } from "@tanstack/react-query";
import { SyncAdapter, SyncOptions, SyncResult } from "../common";

/** @internal */
export const SyncContext = createContext<{
  sync?: SyncResult;
} | null>(null);

export type Props = Omit<SyncOptions, "publicClient"> & {
  chainId: number;
  adapter: SyncAdapter;
  children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SyncProvider({ chainId, adapter, children, ...syncOptions }: Props) {
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

      return adapter({ publicClient: client, ...syncOptions });
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

    return (): void => {
      sub.unsubscribe();
    };
  }, [sync]);

  return <SyncContext.Provider value={{ sync }}>{children}</SyncContext.Provider>;
}
