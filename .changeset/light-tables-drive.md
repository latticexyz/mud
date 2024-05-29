---
"@latticexyz/world-modules": patch
---

Fixed `ERC20Module` to register the `TotalSupply` table when creating a new token.

You can register the table on existing Worlds with a Forge script:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { TotalSupply } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/TotalSupply.sol";
import { _totalSupplyTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";

contract RegisterTotalSupply is Script {
  function run(address worldAddress, bytes14 namespace) external {
    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    TotalSupply.register(_totalSupplyTableId(namespace));

    vm.stopBroadcast();
  }
}
```
