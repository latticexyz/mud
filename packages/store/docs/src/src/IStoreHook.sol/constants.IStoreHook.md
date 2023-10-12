# Constants

[Git Source](https://github.com/latticexyz/mud/blob/f62c767e7ff3bda807c592d85227221a00dd9353/src/IStoreHook.sol)

### STORE_HOOK_INTERFACE_ID

```solidity
bytes4 constant STORE_HOOK_INTERFACE_ID = IStoreHook.onBeforeSetRecord.selector ^
  IStoreHook.onAfterSetRecord.selector ^
  IStoreHook.onBeforeSpliceStaticData.selector ^
  IStoreHook.onAfterSpliceStaticData.selector ^
  IStoreHook.onBeforeSpliceDynamicData.selector ^
  IStoreHook.onAfterSpliceDynamicData.selector ^
  IStoreHook.onBeforeDeleteRecord.selector ^
  IStoreHook.onAfterDeleteRecord.selector ^
  ERC165_INTERFACE_ID;
```
