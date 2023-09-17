---
"@latticexyz/store": major
"@latticexyz/world": major
---

Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

```diff
- import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
+ import {
+   BEFORE_SET_RECORD,
+   BEFORE_SET_FIELD,
+   BEFORE_DELETE_RECORD
+ } from "@latticexyz/store/storeHookTypes.sol";

  StoreCore.registerStoreHook(
    tableId,
    subscriber,
-   StoreHookLib.encodeBitmap({
-     onBeforeSetRecord: true,
-     onAfterSetRecord: false,
-     onBeforeSetField: true,
-     onAfterSetField: false,
-     onBeforeDeleteRecord: true,
-     onAfterDeleteRecord: false
-   })
+   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
  );
```

```diff
- import { SystemHookLib } from "../src/SystemHook.sol";
+ import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

  world.registerSystemHook(
    systemId,
    subscriber,
-   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
+   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
  );

```
