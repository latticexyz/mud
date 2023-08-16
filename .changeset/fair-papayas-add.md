---
"create-mud": patch
---

- update `getBurnerWallet` from `@latticexyz/std-client` to `getBurnerPrivateKey` from `@latticexyz/common`
  ```diff
  - import { getBurnerWallet } from "@latticexyz/std-client";
  + import { getBurnerPrivateKey } from "@latticexyz/common";

  return {
  - privateKey: getBurnerWallet().value,
  + privateKey: getBurnerPrivateKey(),
  // ...
  }
  ```
- update `createFaucetService` import from `@latticexyz/network` to `@latticexyz/services/faucet`
  ```diff
  - import { createFaucetService } from "@latticexyz/network";
  + import { createFaucetService } from "@latticexyz/services/faucet";
  ```
- remove `@latticexyz/std-client` dependency since it is deprecated
- remove `@latticexyz/network` dependency since it no longer exists
