---
"@latticexyz/store-indexer": major
---

Removed `tableIds` filter option in favor of the more flexible `filters` option that accepts `tableId` and an optional `key0` and/or `key1` to filter data by tables and keys.

If you were using an indexer client directly, you'll need to update your query:

```diff
  await indexer.findAll.query({
    chainId,
    address,
-   tableIds: ['0x...'],
+   filters: [{ tableId: '0x...' }],
  });
```
