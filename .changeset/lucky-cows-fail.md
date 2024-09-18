---
"@latticexyz/store-sync": patch
"@latticexyz/world": patch
---

Added a `syncToStash` util to hydrate a `stash` client store from MUD contract state.

```ts
import config from "mud.config";
import { createStash } from "@latticexyz/stash/internal";
import { createClient, http } from "viem";
import { anvil } from "viem/chains";

const address = "0x...";
const stash = createStash(config);
const client = createClient({
  chain: anvil,
  transport: http(),
});

const sync = await syncToStash({ config, stash, client, address });
// subscribe to start the sync
sync.storedBlockLogs$.subscribe();
```
