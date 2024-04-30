---
"@latticexyz/store-sync": patch
---

Updated `createStoreSync` to default to the chain's indexer URL when no `indexerUrl` is passed in. To intentionally unset the value and not use the indexer at all, `indexerUrl` can now also be `false`.
