---
"@latticexyz/store-sync": patch
---

Added an experimental `@latticexyz/store-sync/react` export with a `SyncProvider` and `useSync` hook. This allows for easier syncing MUD data to React apps.

Note that this is currently only usable with Stash and assumes you are also using Wagmi in your React app.

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { SyncProvider } from "@latticexyz/store-sync/react";
import { createSyncAdapter } from "@latticexyz/store-sync/internal";

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SyncProvider
          chainId={chainId}
          address={worldAddress}
          startBlock={startBlock}
          adapter={createSyncAdapter({ stash })}
        >
          {children}
        </SyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```
