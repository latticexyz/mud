---
"@latticexyz/store": major
"@latticexyz/world": major
---

- The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

- It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

  ```diff
  function registerStoreHook(
    bytes32 tableId,
  - IStoreHook hookAddress
  + IStoreHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;

  function registerSystemHook(
    bytes32 systemId,
  - ISystemHook hookAddress
  + ISystemHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;
  ```

  There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

  ```solidity
  import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

  uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
    onBeforeSetRecord: true,
    onAfterSetRecord: true,
    onBeforeSetField: true,
    onAfterSetField: true,
    onBeforeDeleteRecord: true,
    onAfterDeleteRecord: true
  });
  ```

  ```solidity
  import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

  uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
    onBeforeCallSystem: true,
    onAfterCallSystem: true
  });
  ```

- The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.
