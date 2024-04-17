---
"@latticexyz/store": patch
---

Patched `StoreRead.getDynamicFieldLength` to properly read `StoreCore.getDynamicFieldLength`.

Previously `StoreRead.getDynamicFieldLength` incorrectly read from `StoreCore.getFieldLength`, which expected a `fieldIndex` instead of a `dynamicFieldIndex`, and thereby returned an invalid result if the table had both static and dynamic fields (in which case `fieldIndex` != `dynamicFieldIndex`). `StoreRead` is used for external reads from the `Store`/`World` contract, so this bug only materialized in external table reads (ie from `Systems` outside the root namespace) of the dynamic length of a field in a table with both static and dynamic fields.
