import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createSyncAdapter } from "@latticexyz/store-sync/internal";
import { SyncProvider } from "@latticexyz/store-sync/react";
import { stash } from "./mud/stash";
import { defineConfig, EntryKitProvider } from "@latticexyz/entrykit/internal";
import { wagmiConfig } from "./wagmiConfig";
import { chainId, startBlock, worldAddress } from "./common";

const queryClient = new QueryClient();

export type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  if (!worldAddress) {
    return "No world address configured. Is the world still deploying?";
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EntryKitProvider config={defineConfig({ chainId, worldAddress })}>
          <SyncProvider
            chainId={chainId}
            address={worldAddress}
            startBlock={startBlock}
            adapter={createSyncAdapter({ stash })}
          >
            {children}
          </SyncProvider>
        </EntryKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
