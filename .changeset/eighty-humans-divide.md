---
"@latticexyz/explorer": patch
---

Transactions in Observe tab are now populated with timing metrics when using the `observer` Viem decorator in local projects.

You can wire up your local project to use transaction timings with:
```
import { observer } from "@latticexyz/explorer/observer";

// Extend the Viem client that is performing writes
walletClient.extend(observer());
```
