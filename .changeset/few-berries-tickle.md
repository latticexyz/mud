---
"create-mud": patch
"@latticexyz/cli": major
"@latticexyz/common": major
"@latticexyz/store": patch
"@latticexyz/world": patch
"@latticexyz/world-modules": patch
---

Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

```diff
-import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
+import { SomeTable } from "./codegen/tables/SomeTable.sol";

-console.log(SomeTableTableId);
+console.log(SomeTable._tableId);

-console.log(SomeTable.getFieldLayout());
+console.log(SomeTable._fieldLayout);
```
