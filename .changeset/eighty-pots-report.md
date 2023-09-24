---
"@latticexyz/store": major
---

The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

```diff
IStore {
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes data,
-   PackedCounter encodedLengths
  );
}

IStoreHook {
  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;
}
```
