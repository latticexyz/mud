---
"@latticexyz/common": patch
---

Added `logSort` method to help when sorting logs fetched from RPC, where they come back ordered relative to the topics used.

```ts
import { logSort } from "@latticexyz/common";

const logs = getLogs(...);
logs.sort(logSort);
```
