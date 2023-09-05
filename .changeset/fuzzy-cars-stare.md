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
    ) {}

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) {}
  ```

- The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.
