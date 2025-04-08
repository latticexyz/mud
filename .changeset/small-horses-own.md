---
"@latticexyz/world": patch
"@latticexyz/cli": patch
---

`mud` CLI commands will now recognize systems without a `System` suffix if they inherit directly from the base `System` imported from `@latticexyz/world/src/System.sol`.

```solidity
import {System} from "@latticexyz/world/src/System.sol";

contract EntityProgram is System {
  ...
}
```
