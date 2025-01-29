---
"@latticexyz/store-indexer": patch
---

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, use `INTERNAL__VALIDATE_BLOCK_RANGE=true` environment variable when starting up any of the indexers. This requires `RPC_HTTP_URL` to also be set.

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.
