---
"@latticexyz/std-client": major
"@latticexyz/common": major
---

Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

- `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

  ```
  - import { getBurnerWallet } from "@latticexyz/std-client";
  + import { getBurnerPrivateKey } from "@latticexyz/common";

  - const privateKey = getBurnerWallet().value;
  - const privateKey = getBurnerPrivateKey();
  ```

- All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.

- Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

  ```diff
  - import { ... } from "@latticexyz/std-client";
  + import { ... } from "@latticexyz/std-client/deprecated";
  ```
