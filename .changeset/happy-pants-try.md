---
"@latticexyz/world-modules": minor
---

Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
This allows standards like `ERC20` (that require a specific interface and events to be emitted by a unique contract) to be implemented inside a MUD World.

The puppet serves as a proxy, forwarding all calls to the implementation system (also called the "puppet master").
The "puppet master" system can emit events from the puppet contract.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { createPuppet } from "@latticexyz/world-modules/src/modules/puppet/createPuppet.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

// Install the puppet module
world.installModule(new PuppetModule(), new bytes(0));

// Set up the `StoreSwitch` context if not calling from within a `World` context already
StoreSwitch.setStoreAddress(address(world));

// Register a new puppet for any system
// The system must implement the `CustomInterface`,
// and the caller must own the system's namespace
CustomInterface puppet = CustomInterface(createPuppet(<systemId>));
```
