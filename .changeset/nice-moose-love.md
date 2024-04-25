---
"@latticexyz/store-sync": minor
---

Export `singletonEntity` as const rather than within the `syncToRecs` result.

```diff
- const { singletonEntity, ... } = syncToRecs({ ... });
+ import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
+ const { ... } = syncToRecs({ ... });
```
