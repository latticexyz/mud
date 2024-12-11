---
"@latticexyz/store-sync": patch
"@latticexyz/world": patch
---

Added a `getRecords` util to fetch table records from an indexer or RPC.

Migrated the `getFunctions` and `getWorldAbi` utils from `@latticexyz/world` to `@latticexyz/store-sync/world` to allow `getFunctions` and `getWorldAbi` to use `getRecords` internally without circular dependencies.
