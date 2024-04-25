---
"@latticexyz/store-sync": patch
---

Add `startBlock` option to `syncToRecs`.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import worlds from "contracts/worlds.json";

syncToRecs({
  startBlock: worlds['31337'].blockNumber,
  ...
});
```
