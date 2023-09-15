---
"@latticexyz/block-logs-stream": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
---

Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);

event StoreSetField(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key
);

event StoreEphemeralRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);
```
