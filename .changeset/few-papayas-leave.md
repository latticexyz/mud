---
"@latticexyz/store": major
"@latticexyz/world": major
---

- The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

- All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.

- `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

  These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
  the new splice hooks.

  `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

  ```solidity
  interface IStore {
    // Splice data in the static part of the record
    function spliceStaticData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes calldata data
    ) external;

    // Splice data in the dynamic part of the record
    function spliceDynamicData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
      bytes calldata data
    ) external;
  }
  ```
