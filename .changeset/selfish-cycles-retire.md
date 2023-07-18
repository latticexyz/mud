---
"@latticexyz/std-contracts": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

```solidity
// old import
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// new import
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
```

StoreSwitch has been rewritten to use a storage slot instead of `function isStore()` to determine which contract is Store.
