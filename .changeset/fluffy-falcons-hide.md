---
"@latticexyz/block-logs-stream": patch
"@latticexyz/store-sync": patch
---

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, replace `publicClient: Client` in your sync method (e.g. `syncToStash`) with `internal_chain: Chain` and `internal_validateBlockRange: true`. For `<SyncProvider>`, only the `internal_validateBlockRange` prop is needed.

```diff
-syncToStash({ publicClient, ... });
+syncToStash({ internal_chain: chain, internal_validateBlockRange: true, ... });
```

```diff
-<SyncProvider adapter={createSyncAdapter(...)}>
+<SyncProvider adapter={createSyncAdapter(...)} internal_validateBlockRange>
```

Note that using this option expects support for batched RPC calls and each call to `eth_getLogs` will make an additional call to `eth_getBlockByNumber`.
