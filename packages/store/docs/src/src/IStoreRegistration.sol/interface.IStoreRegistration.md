# IStoreRegistration

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreRegistration.sol)

The IStoreRegistration interface includes methods for managing table field layouts,
metadata, and hooks, which are usually called once in the setup phase of an application,
making them less performance critical than the methods.

## Functions

### registerTable

```solidity
function registerTable(
  ResourceId tableId,
  FieldLayout fieldLayout,
  Schema keySchema,
  Schema valueSchema,
  string[] calldata keyNames,
  string[] calldata fieldNames
) external;
```

### registerStoreHook

```solidity
function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) external;
```

### unregisterStoreHook

```solidity
function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) external;
```
