---
"@latticexyz/store-sync": minor
---

Refactored how we fetch snapshots from an indexer, preferring the new `getLogs` endpoint and falling back to the previous `findAll` if it isn't available. This refactor also prepares for an easier entry point for adding client caching of snapshots.

The `initialState` option for various sync methods (`syncToPostgres`, `syncToRecs`, etc.) is now deprecated in favor of `initialBlockLogs`. For now, we'll automatically convert `initialState` into `initialBlockLogs`, but if you want to update your code, you can do:

```ts
import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";

const initialBlockLogs = {
  blockNumber: initialState.blockNumber,
  logs: tablesWithRecordsToLogs(initialState.tables),
};
```
