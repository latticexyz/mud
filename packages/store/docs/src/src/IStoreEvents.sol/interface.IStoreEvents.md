# IStoreEvents

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreEvents.sol)

## Events

### Store_SetRecord

Emitted when a new record is set in the store.

```solidity
event Store_SetRecord(
    ResourceId indexed tableId, bytes32[] keyTuple, bytes staticData, PackedCounter encodedLengths, bytes dynamicData
);
```

### Store_SpliceStaticData

Emitted when static data in the store is spliced.

_In static data, data is always overwritten starting at the start position,
so the total length of the data remains the same and no data is shifted._

```solidity
event Store_SpliceStaticData(ResourceId indexed tableId, bytes32[] keyTuple, uint48 start, bytes data);
```

### Store_SpliceDynamicData

Emitted when dynamic data in the store is spliced.

```solidity
event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes data
);
```

### Store_DeleteRecord

Emitted when a record is deleted from the store.

```solidity
event Store_DeleteRecord(ResourceId indexed tableId, bytes32[] keyTuple);
```
