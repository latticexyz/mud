---
"@latticexyz/store-sync": patch
---

Added an RECS sync adapter to be used with `SyncProvider` in React apps.

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { SyncProvider } from "@latticexyz/store-sync/react";
import { createSyncAdapter } from "@latticexyz/store-sync/recs";
import { createWorld } from "@latticexyz/recs";
import config from "./mud.config";

const world = createWorld();
const { syncAdapter, components } = createSyncAdapter({ world, config });

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SyncProvider
          chainId={chainId}
          address={worldAddress}
          startBlock={startBlock}
          adapter={syncAdapter}
        >
          {children}
        </SyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```
