---
"@latticexyz/store-sync": patch
---

Added a `syncToStash` util to hydrate a `stash` client store from MUD contract state. This is currently exported from `@latticexyz/store-sync/internal` while Stash package is unstable/experimental.

```ts
import config from "mud.config";
import { createClient, http } from "viem";
import { anvil } from "viem/chains";
import { createStash } from "@latticexyz/stash/internal";
import { syncToStash } from "@latticexyz/store-sync/internal";

const address = "0x...";
const client = createClient({
  chain: anvil,
  transport: http(),
});

const stash = createStash(config);
const sync = await syncToStash({ stash, client, address });
```
