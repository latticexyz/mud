---
"@latticexyz/store": patch
---

Aligned the order of function arguments in the `Storage`` library.

```solidity
store(uint256 storagePointer, uint256 offset, bytes memory data)
store(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
load(uint256 storagePointer, uint256 offset, uint256 length)
load(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
```
