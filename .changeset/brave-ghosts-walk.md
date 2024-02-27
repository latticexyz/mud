---
"@latticexyz/store-indexer": minor
"@latticexyz/store-sync": minor
---

Added a `followBlockTag` option to configure which block number to follow when running `createStoreSync`. It defaults to `latest` (current behavior), which is recommended for individual clients so that you always have the latest chain state.

Indexers now default to `safe` to avoid issues with reorgs and load-balanced RPCs being out of sync. This means indexers will be slightly behind the latest block number, but clients can quickly catch up.
