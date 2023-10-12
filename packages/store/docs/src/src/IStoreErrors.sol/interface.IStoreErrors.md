# IStoreErrors

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreErrors.sol)

## Errors

### Store_TableAlreadyExists

```solidity
error Store_TableAlreadyExists(ResourceId tableId, string tableIdString);
```

### Store_TableNotFound

```solidity
error Store_TableNotFound(ResourceId tableId, string tableIdString);
```

### Store_InvalidResourceType

```solidity
error Store_InvalidResourceType(bytes2 expected, ResourceId resourceId, string resourceIdString);
```

### Store_InvalidDynamicDataLength

```solidity
error Store_InvalidDynamicDataLength(uint256 expected, uint256 received);
```

### Store_IndexOutOfBounds

```solidity
error Store_IndexOutOfBounds(uint256 length, uint256 accessedIndex);
```

### Store_InvalidKeyNamesLength

```solidity
error Store_InvalidKeyNamesLength(uint256 expected, uint256 received);
```

### Store_InvalidFieldNamesLength

```solidity
error Store_InvalidFieldNamesLength(uint256 expected, uint256 received);
```

### Store_InvalidValueSchemaLength

```solidity
error Store_InvalidValueSchemaLength(uint256 expected, uint256 received);
```

### Store_InvalidSplice

```solidity
error Store_InvalidSplice(uint40 startWithinField, uint40 deleteCount, uint40 fieldLength);
```
