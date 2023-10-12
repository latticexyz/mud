# IStoreData

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreData.sol)

**Inherits:**
[IStoreRead](/src/IStoreRead.sol/interface.IStoreRead.md), [IStoreWrite](/src/IStoreWrite.sol/interface.IStoreWrite.md)

The IStoreData interface includes methods for reading and writing table values.

_These methods are frequently invoked during runtime, so it is essential to prioritize optimizing their gas cost._

## Functions

### storeVersion

Returns the version of the Store contract.

```solidity
function storeVersion() external view returns (bytes32 version);
```

**Returns**

| Name      | Type      | Description                        |
| --------- | --------- | ---------------------------------- |
| `version` | `bytes32` | The version of the Store contract. |

## Events

### HelloStore

Emitted when the store is initialized.

```solidity
event HelloStore(bytes32 indexed storeVersion);
```
