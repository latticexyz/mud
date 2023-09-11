---
"@latticexyz/store": minor
"@latticexyz/world": minor
---

It is now possible to unregister Store hooks and System hooks.

```solidity
interface IStore {
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
  // ...
}

interface IWorld {
  function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
  // ...
}
```
