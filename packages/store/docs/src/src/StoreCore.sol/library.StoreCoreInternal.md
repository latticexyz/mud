# StoreCoreInternal

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/StoreCore.sol)

_This library contains internal functions used by StoreCore.
They are not intended to be used directly by consumers of StoreCore._

## State Variables

### SLOT

```solidity
bytes32 internal constant SLOT = keccak256("mud.store");
```

### DYNMAIC_DATA_SLOT

```solidity
bytes32 internal constant DYNMAIC_DATA_SLOT = keccak256("mud.store.dynamicData");
```

### DYNAMIC_DATA_LENGTH_SLOT

```solidity
bytes32 internal constant DYNAMIC_DATA_LENGTH_SLOT = keccak256("mud.store.dynamicDataLength");
```

## Functions

### \_spliceDynamicData

SET DATA

Splice dynamic data in the store.

_This function checks various conditions to ensure the operation is valid.
It emits a `Store_SpliceDynamicData` event, calls `onBeforeSpliceDynamicData` hooks before actually modifying the storage,
and calls `onAfterSpliceDynamicData` hooks after modifying the storage.
It reverts with `Store_InvalidResourceType` if the table ID is not a table.
(Splicing dynamic data is not supported for offchain tables, as it requires reading the previous encoded lengths from storage.)
It reverts with `Store_InvalidSplice` if the splice total length of the field is changed but the splice is not at the end of the field.
It reverts with `Store_IndexOutOfBounds` if the start index is larger than the previous length of the field._

```solidity
function _spliceDynamicData(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex,
  uint40 startWithinField,
  uint40 deleteCount,
  bytes memory data,
  PackedCounter previousEncodedLengths
) internal;
```

**Parameters**

| Name                     | Type            | Description                                                                                                                                               |
| ------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tableId`                | `ResourceId`    | The ID of the table to splice dynamic data.                                                                                                               |
| `keyTuple`               | `bytes32[]`     | An array representing the composite key for the record.                                                                                                   |
| `dynamicFieldIndex`      | `uint8`         | The index of the dynamic field to splice data, relative to the start of the dynamic fields. (Dynamic field index = field index - number of static fields) |
| `startWithinField`       | `uint40`        | The start index within the field for the splice operation.                                                                                                |
| `deleteCount`            | `uint40`        | The number of bytes to delete in the splice operation.                                                                                                    |
| `data`                   | `bytes`         | The data to insert into the dynamic data of the record at the start byte.                                                                                 |
| `previousEncodedLengths` | `PackedCounter` | The previous encoded lengths of the dynamic data of the record.                                                                                           |

### \_getStaticData

GET DATA

Get full static data for the given table ID and key tuple, with the given length in bytes.

```solidity
function _getStaticData(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint256 length
) internal view returns (bytes memory);
```

**Parameters**

| Name       | Type         | Description                                             |
| ---------- | ------------ | ------------------------------------------------------- |
| `tableId`  | `ResourceId` | The ID of the table to get the static data from.        |
| `keyTuple` | `bytes32[]`  | An array representing the composite key for the record. |
| `length`   | `uint256`    | The length of the static data to retrieve.              |

**Returns**

| Name     | Type    | Description                                   |
| -------- | ------- | --------------------------------------------- |
| `<none>` | `bytes` | The full static data of the specified length. |

### \_getStaticFieldBytes

Get a single static field from the given table ID and key tuple, with the given value field layout.

```solidity
function _getStaticFieldBytes(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 fieldIndex,
  FieldLayout fieldLayout
) internal view returns (bytes memory);
```

**Parameters**

| Name          | Type          | Description                                             |
| ------------- | ------------- | ------------------------------------------------------- |
| `tableId`     | `ResourceId`  | The ID of the table to get the static field from.       |
| `keyTuple`    | `bytes32[]`   | An array representing the composite key for the record. |
| `fieldIndex`  | `uint8`       | The index of the field to get.                          |
| `fieldLayout` | `FieldLayout` | The field layout for the record.                        |

**Returns**

| Name     | Type    | Description                                                      |
| -------- | ------- | ---------------------------------------------------------------- |
| `<none>` | `bytes` | The static field data as dynamic bytes in the size of the field. |

### \_getStaticDataLocation

HELPER FUNCTIONS

Compute the storage location based on table ID and key tuple.

```solidity
function _getStaticDataLocation(ResourceId tableId, bytes32[] memory keyTuple) internal pure returns (uint256);
```

**Parameters**

| Name       | Type         | Description                                             |
| ---------- | ------------ | ------------------------------------------------------- |
| `tableId`  | `ResourceId` | The ID of the table.                                    |
| `keyTuple` | `bytes32[]`  | An array representing the composite key for the record. |

**Returns**

| Name     | Type      | Description                                                    |
| -------- | --------- | -------------------------------------------------------------- |
| `<none>` | `uint256` | The computed storage location based on table ID and key tuple. |

### \_getStaticDataLocation

Compute the storage location based on table ID and a single key.

```solidity
function _getStaticDataLocation(ResourceId tableId, bytes32 key) internal pure returns (uint256);
```

**Parameters**

| Name      | Type         | Description                    |
| --------- | ------------ | ------------------------------ |
| `tableId` | `ResourceId` | The ID of the table.           |
| `key`     | `bytes32`    | The single key for the record. |

**Returns**

| Name     | Type      | Description                                              |
| -------- | --------- | -------------------------------------------------------- |
| `<none>` | `uint256` | The computed storage location based on table ID and key. |

### \_getStaticDataOffset

Get storage offset for the given value field layout and index.

```solidity
function _getStaticDataOffset(FieldLayout fieldLayout, uint8 fieldIndex) internal pure returns (uint256);
```

**Parameters**

| Name          | Type          | Description                                   |
| ------------- | ------------- | --------------------------------------------- |
| `fieldLayout` | `FieldLayout` | The field layout for the record.              |
| `fieldIndex`  | `uint8`       | The index of the field to get the offset for. |

**Returns**

| Name     | Type      | Description                                                  |
| -------- | --------- | ------------------------------------------------------------ |
| `<none>` | `uint256` | The storage offset for the specified field layout and index. |

### \_getDynamicDataLocation

Compute the storage location based on table ID, key tuple, and dynamic field index.

```solidity
function _getDynamicDataLocation(
  ResourceId tableId,
  bytes32[] memory keyTuple,
  uint8 dynamicFieldIndex
) internal pure returns (uint256);
```

**Parameters**

| Name                | Type         | Description                                                                                                                                |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `tableId`           | `ResourceId` | The ID of the table.                                                                                                                       |
| `keyTuple`          | `bytes32[]`  | An array representing the composite key for the record.                                                                                    |
| `dynamicFieldIndex` | `uint8`      | The index of the dynamic field, relative to the start of the dynamic fields. (Dynamic field index = field index - number of static fields) |

**Returns**

| Name     | Type      | Description                                                                          |
| -------- | --------- | ------------------------------------------------------------------------------------ |
| `<none>` | `uint256` | The computed storage location based on table ID, key tuple, and dynamic field index. |

### \_getDynamicDataLengthLocation

Compute the storage location for the length of the dynamic data based on table ID and key tuple.

```solidity
function _getDynamicDataLengthLocation(ResourceId tableId, bytes32[] memory keyTuple) internal pure returns (uint256);
```

**Parameters**

| Name       | Type         | Description                                             |
| ---------- | ------------ | ------------------------------------------------------- |
| `tableId`  | `ResourceId` | The ID of the table.                                    |
| `keyTuple` | `bytes32[]`  | An array representing the composite key for the record. |

**Returns**

| Name     | Type      | Description                                                                                       |
| -------- | --------- | ------------------------------------------------------------------------------------------------- |
| `<none>` | `uint256` | The computed storage location for the length of the dynamic data based on table ID and key tuple. |

### \_loadEncodedDynamicDataLength

Load the encoded dynamic data length from storage for the given table ID and key tuple.

```solidity
function _loadEncodedDynamicDataLength(
  ResourceId tableId,
  bytes32[] memory keyTuple
) internal view returns (PackedCounter);
```

**Parameters**

| Name       | Type         | Description                                             |
| ---------- | ------------ | ------------------------------------------------------- |
| `tableId`  | `ResourceId` | The ID of the table.                                    |
| `keyTuple` | `bytes32[]`  | An array representing the composite key for the record. |

**Returns**

| Name     | Type            | Description                                                                               |
| -------- | --------------- | ----------------------------------------------------------------------------------------- |
| `<none>` | `PackedCounter` | The loaded encoded dynamic data length from storage for the given table ID and key tuple. |
