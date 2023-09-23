---
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": minor
"@latticexyz/dev-tools": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": major
"@latticexyz/world": major
"create-mud": patch
---

- The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

- The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
  This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

  ```diff

  event Store_SpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
  - uint40 deleteCount,
    bytes data
  );

  interface IStore {
    function spliceStaticData(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      uint48 start,
  -   uint40 deleteCount,
      bytes calldata data
    ) external;
  }

  ```

- All methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `updateInField`, `getFieldSlice`)
  have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `updateInDynamicField`, `getDynamicFieldSlice`).

  Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
  The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

  ```diff
  interface IStore {
  - function pushToField(
  + function pushToDynamicField(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
      bytes calldata dataToPush,
  -   FieldLayout fieldLayout
    ) external;

  - function popFromField(
  + function popFromDynamicField(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
      uint256 byteLengthToPop,
  -   FieldLayout fieldLayout
    ) external;

  - function updateInField(
  + function updateInDynamicField(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
      uint256 startByteIndex,
      bytes calldata dataToSet,
  -   FieldLayout fieldLayout
    ) external;

  - function getFieldSlice(
  + function getDynamicFieldSlice(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
  -   FieldLayout fieldLayout,
      uint256 start,
      uint256 end
    ) external view returns (bytes memory data);
  }
  ```

- `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.
  
  ```diff
  IStore {
  + function getDynamicFieldLength(
  +   ResourceId tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex
  + ) external view returns (uint256);
  }

- `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.

- `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.

- The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
  This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

  
