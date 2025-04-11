---
"@latticexyz/world": patch
"@latticexyz/cli": patch
---

`mud` CLI commands will now recognize systems if they inherit directly from the base `System` imported from `@latticexyz/world/src/System.sol`, allowing you to write systems without a `System` suffix.

```solidity
import {System} from "@latticexyz/world/src/System.sol";

contract EntityProgram is System {
  ...
}
```

If you have contracts that inherit from the base `System` that aren't meant to be deployed, you can mark them as `abstract contract` or [disable the system's deploy via config](https://mud.dev/config/reference).
