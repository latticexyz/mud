---
"@latticexyz/cli": major
"@latticexyz/store": major
"@latticexyz/world": major
---

All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

```diff
  function setRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
+   Schema valueSchema
  ) external;
```
The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
so downstream projects only need to regenerate their table libraries after updating MUD.
