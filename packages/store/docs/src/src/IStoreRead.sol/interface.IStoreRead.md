# IStoreRead

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreRead.sol)

## Functions

### getFieldLayout

```solidity
function getFieldLayout(ResourceId tableId) external view returns (FieldLayout fieldLayout);
```

### getValueSchema

```solidity
function getValueSchema(ResourceId tableId) external view returns (Schema valueSchema);
```

### getKeySchema

```solidity
function getKeySchema(ResourceId tableId) external view returns (Schema keySchema);
```

### getRecord

Get full record (all fields, static and dynamic data) for the given tableId and key tuple, loading the field layout from storage

```solidity
function getRecord(
  ResourceId tableId,
  bytes32[] calldata keyTuple
) external view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData);
```

### getRecord

Get full record (all fields, static and dynamic data) for the given tableId and key tuple, with the given field layout

```solidity
function getRecord(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  FieldLayout fieldLayout
) external view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData);
```

### getField

Get a single field from the given tableId and key tuple, loading the field layout from storage

```solidity
function getField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 fieldIndex
) external view returns (bytes memory data);
```

### getField

Get a single field from the given tableId and key tuple, with the given field layout

```solidity
function getField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 fieldIndex,
  FieldLayout fieldLayout
) external view returns (bytes memory data);
```

### getStaticField

Get a single static field from the given tableId and key tuple, with the given value field layout.
Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
Consumers are expected to truncate the returned value as needed.

```solidity
function getStaticField(
  ResourceId tableId,
  bytes32[] calldata keyTuple,
  uint8 fieldIndex,
  FieldLayout fieldLayout
) external view returns (bytes32);
```

### getDynamicField

Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
(Dynamic field index = field index - number of static fields)

```solidity
function getDynamicField(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex
) external view returns (bytes memory);
```

### getFieldLength

Get the byte length of a single field from the given tableId and key tuple, loading the field layout from storage

```solidity
function getFieldLength(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 fieldIndex
) external view returns (uint256);
```

### getFieldLength

Get the byte length of a single field from the given tableId and key tuple, with the given value field layout

```solidity
function getFieldLength(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 fieldIndex,
  FieldLayout fieldLayout
) external view returns (uint256);
```

### getDynamicFieldLength

Get the byte length of a single dynamic field from the given tableId and key tuple

```solidity
function getDynamicFieldLength(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex
) external view returns (uint256);
```

### getDynamicFieldSlice

Get a byte slice (including start, excluding end) of a single dynamic field from the given tableId and key tuple, with the given value field layout.
The slice is unchecked and will return invalid data if `start`:`end` overflow.

```solidity
function getDynamicFieldSlice(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex,
  uint256 start,
  uint256 end
) external view returns (bytes memory data);
```
