---
"@latticexyz/block-logs-stream": patch
"@latticexyz/store-sync": patch
---

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, replace `publicClient: Client` with `internal_clientOptions: { chain: Chain, validateBlockRange: true }` when calling any sync method (e.g. `syncToStash`). For `<SyncProvider>`, only a `internal_validateBlockRange` prop is needed.

```diff
-syncToStash({ publicClient, ... });
+syncToStash({ internal_clientOptions: { chain, validateBlockRange: true }, ... });
```

```diff
-<SyncProvider adapter={createSyncAdapter(...)}>
+<SyncProvider adapter={createSyncAdapter(...)} internal_validateBlockRange>
```

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.
