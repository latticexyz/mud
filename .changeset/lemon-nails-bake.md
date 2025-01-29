---
"@latticexyz/block-logs-stream": patch
---

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, replace `publicClient: Client` with `internal_clientOptions: { chain: Chain, validateBlockRange: true }` when calling `fetchLogs` or `fetchBlockLogs`.

```diff
-fetchLogs({ publicClient, ... });
+fetchLogs({ internal_clientOptions: { chain, validateBlockRange: true }, ... });
```

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.
