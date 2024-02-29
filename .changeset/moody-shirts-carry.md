---
"@latticexyz/common": minor
"create-mud": minor
---

Added viem custom client actions that work the same as MUD's now-deprecated `getContract`, `writeContract`, and `sendTransaction` wrappers. Templates have been updated to reflect the new patterns.

You can migrate your own code like this:

```diff
-import { createWalletClient } from "viem";
-import { getContract, writeContract, sendTransaction } from "@latticexyz/common";
+import { createWalletClient, getContract } from "viem";
+import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

-const walletClient = createWalletClient(...);
+const walletClient = createWalletClient(...)
+  .extend(transactionQueue())
+  .extend(writeObserver({ onWrite });

 const worldContract = getContract({
   client: { publicClient, walletClient },
-  onWrite,
});
```
Code previously written as:

```ts
const worldContract = mud_getContract({
  // ...
  client: { /* ... */, wallet: walletClient },
  onWrite,
 });
```
