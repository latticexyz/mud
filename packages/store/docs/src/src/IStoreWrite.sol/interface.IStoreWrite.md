# IStoreWrite

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreWrite.sol)

**Inherits:**
[IStoreEvents](/src/IStoreEvents.sol/interface.IStoreEvents.md)

## Functions

### setRecord

```solidity
function setRecord(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  bytes calldata staticData,
  PackedCounter encodedLengths,
  bytes calldata dynamicData
) external;
```

### spliceStaticData

```solidity
function spliceStaticData(ResourceId tableId, bytes32[] calldata keyTuple, uint48 start, bytes calldata data) external;
```

### spliceDynamicData

```solidity
function spliceDynamicData(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 dynamicFieldIndex,
  uint40 startWithinField,
  uint40 deleteCount,
  bytes calldata data
) external;
```

### setField

```solidity
function setField(ResourceId tableId, bytes32[] calldata keyTuple, uint8 fieldIndex, bytes calldata data) external;
```

### setField

```solidity
function setField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 fieldIndex,
  bytes calldata data,
  FieldLayout fieldLayout
) external;
```

### setStaticField

```solidity
function setStaticField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 fieldIndex,
  bytes calldata data,
  FieldLayout fieldLayout
) external;
```

### setDynamicField

```solidity
function setDynamicField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 dynamicFieldIndex,
  bytes calldata data
) external;
```

### pushToDynamicField

```solidity
function pushToDynamicField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 dynamicFieldIndex,
  bytes calldata dataToPush
) external;
```

### popFromDynamicField

```solidity
function popFromDynamicField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 dynamicFieldIndex,
  uint256 byteLengthToPop
) external;
```

### deleteRecord

```solidity
function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) external;
```
