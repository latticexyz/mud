---
"@latticexyz/std-contracts": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

`MudV2Test` has been renamed to `MudTest` and moved to another package.
```solidity
// old import
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// new import
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
```

StoreSwitch has been rewritten to use a storage slot instead of `function isStore()` to determine which contract is Store.
