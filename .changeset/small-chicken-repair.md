---
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": major
"@latticexyz/dev-tools": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": major
"create-mud": minor
---

What used to be known as `ephemeral` table is now called `offchain` table.
The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

```diff
- EphemeralTable.emitEphemeral(value);
+ OffchainTable.set(value);
```
