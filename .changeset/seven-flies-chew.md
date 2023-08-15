---
"@latticexyz/services": major
"@latticexyz/network": major
---

Move `createFaucetService` from `@latticexyz/network` to `@latticexyz/services/faucet`.

```diff
- import { createFaucetService } from "@latticexyz/network";
+ import { createFaucetService } from "@latticexyz/services/faucet";
```
