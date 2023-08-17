---
"@latticexyz/common": patch
"@latticexyz/store-sync": patch
---

Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.
