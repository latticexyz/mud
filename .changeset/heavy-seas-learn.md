---
"@latticexyz/cli": patch
"@latticexyz/world": patch
---

Fixed `resolveTableId` usage within config's module `args` to allow referencing both namespaced tables (e.g. `resolveTableId("app_Tasks")`) as well as tables by just their name (e.g. `resolveTableId("Tasks")`). Note that using just the table name requires it to be unique among all tables within the config.

This helper is now exported from `@latticexyz/world` package as intended. The previous, deprecated export has been removed.

```diff
-import { resolveTableId } from "@latticexyz/config/library";
+import { resolveTableId } from "@latticexyz/world/internal";
```
