---
"@latticexyz/store-sync": patch
---

Refactored `syncToRecs` and `syncToZustand` to use tables from config namespaces output. This is a precursor for supporting multiple namespaces.

Note for library authors: If you were using `createStorageAdapter` from `@latticexyz/store-sync/recs`, this helper no longer appends MUD's built-in tables from Store and World packages. This behavior was moved into `syncToRecs` for consistency with `syncToZustand` and makes `createStorageAdapter` less opinionated.

```diff
 import { createStorageAdapter } from "@latticexyz/store-sync/recs";
+import { mudTables } from "@latticexyz/store-sync";

 createStorageAdapter({
-  tables,
+  tables: { ...tables, ...mudTables },
   ...
 });
```
