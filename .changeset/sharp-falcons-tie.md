---
"@latticexyz/store-sync": minor
---

Added a `filters` option to store sync to allow filtering client data on tables and keys. Previously, it was only possible to filter on `tableIds`, but the new filter option allows for more flexible filtering by key.

If you are building a large MUD application, you can use positional keys as a way to shard data and make it possible to load only the data needed in the client for a particular section of your app. We're using this already in Sky Strife to load match-specific data into match pages without having to load data for all matches, greatly improving load time and client performance.

```ts
syncToRecs({
  ...
  filters: [{ tableId: '0x...', key0: '0x...' }],
});
```

The `tableIds` option is now deprecated and will be removed in the future, but is kept here for backwards compatibility.
