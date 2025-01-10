import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { StashSyncProvider } from "./StashSyncProvider";
import { stash } from "./stash";
import { Address } from "viem";
import { defineConfig, EntryKitProvider } from "@latticexyz/entrykit/internal";
import { wagmiConfig } from "./wagmiConfig";
import { chainId } from "../common";

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
          <StashSyncProvider
            address={worldDeploy.address}
            startBlock={worldDeploy.blockNumber ?? undefined}
            stash={stash}
          >
            {children}
          </StashSyncProvider>
        </EntryKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
