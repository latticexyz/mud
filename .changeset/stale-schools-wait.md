---
"@latticexyz/block-logs-stream": patch
"@latticexyz/dev-tools": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": major
---

`Store` events have been renamed for consistency and readability.
If you're parsing `Store` events manually, you need to update your ABI.
If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

```diff
- event StoreSetRecord(
+ event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );
- event StoreSpliceStaticData(
+ event Store_SpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data
  );
- event StoreSpliceDynamicData(
+ event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    bytes32 encodedLengths
  );
- event StoreDeleteRecord(
+ event Store_DeleteRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple
  );
```
