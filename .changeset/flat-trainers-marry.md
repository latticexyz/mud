---
"@latticexyz/common": patch
"@latticexyz/store-sync": patch
---

Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

```ts
const { blockStorageOperations$ } = syncToRecs({
  ...
  startSync: false,
});

// start sync manually by subscribing to `blockStorageOperation$`
const subcription = blockStorageOperation$.subscribe();

// clean up subscription
subscription.unsubscribe();
```
