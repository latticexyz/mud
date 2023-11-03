---
"@latticexyz/world-modules": minor
---

Added the `ERC20Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC20` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";

// The ERC20 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC20 tokens can be registered
IERC20Mintable token = registerERC20(world, "myERC20", ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
```
