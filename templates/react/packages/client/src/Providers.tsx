import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createSyncAdapter } from "@latticexyz/store-sync/internal";
import { SyncProvider } from "./mud/SyncProvider";
import { stash } from "./mud/stash";
import { Address } from "viem";
import { defineConfig, EntryKitProvider } from "@latticexyz/entrykit/internal";
import { wagmiConfig } from "./wagmiConfig";
import { chainId } from "./common";

const queryClient = new QueryClient();

export type Props = {
  worldDeploy: {
    address: Address;
    blockNumber: bigint | null;
  };
  children: ReactNode;
};

export function Providers({ worldDeploy, children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EntryKitProvider
          config={defineConfig({
            chainId,
            worldAddress: worldDeploy.address,
          })}
        >
          <SyncProvider
            chainId={chainId}
            address={worldDeploy.address}
            startBlock={worldDeploy.blockNumber ?? undefined}
            adapter={createSyncAdapter({ stash })}
          >
            {children}
          </SyncProvider>
        </EntryKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
