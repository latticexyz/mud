---
"@latticexyz/block-logs-stream": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);

event StoreSetField(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
);

event StoreEphemeralRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);
```
