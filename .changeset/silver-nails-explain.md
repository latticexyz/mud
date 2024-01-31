---
"@latticexyz/store-sync": minor
---

Added a Zustand storage adapter and corresponding `syncToZustand` method for use in vanilla and React apps. It's used much like the other sync methods, except it returns a bound store and set of typed tables.

```ts
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import config from "contracts/mud.config";

const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
  config,
  ...
});

// in vanilla apps
const positions = useStore.getState().getRecords(tables.Position);

// in React apps
const positions = useStore((state) => state.getRecords(tables.Position));
```

This change will be shortly followed by an update to our templates that uses Zustand as the default client data store and sync method.
