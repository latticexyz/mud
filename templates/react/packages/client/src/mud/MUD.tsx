import { type ReactNode } from "react";
import { type Network } from "./setupNetwork";
import { NetworkProvider } from "./NetworkContext";
import { StoreSync } from "./StoreSync";
import { WalletManager } from "./wallet/WalletManager";
import { DevTools } from "./DevTools";

type Props = {
  network: Network;
  children: ReactNode;
};

// A React component that encapsulates MUD-related components.
export function MUD({ network, children }: Props) {
  return (
    <NetworkProvider network={network}>
      <StoreSync>
        <WalletManager>
          {children}
          {/* Mounts dev-tools when in development mode. https://vitejs.dev/guide/env-and-mode.html */}
          {import.meta.env.DEV && <DevTools />}
        </WalletManager>
      </StoreSync>
    </NetworkProvider>
  );
}
