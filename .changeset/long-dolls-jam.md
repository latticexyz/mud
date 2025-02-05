---
"@latticexyz/entrykit": patch
---

Using EntryKit without a configured bundler will now throw an error.

Redstone, Garnet, Rhodolite, and Anvil chains come preconfigured. For other chains, you can a bundler RPC URL to your chain config via

```ts
import type { Chain } from "viem";

const chain = {
  ...
  rpcUrls: {
    ...
    bundler: {
      http: ["https://..."],
    },
  },  
} as const satisfies Chain;
```
