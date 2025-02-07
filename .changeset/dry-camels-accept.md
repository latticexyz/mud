---
"@latticexyz/world": patch
---

Added experimental system libraries for World systems for easier ergonomics when interacting with core systems.

Note that these libraries are marked experimental as we may make breaking changes to their interfaces.

```solidity
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/WorldRegistrationSystemLib.sol";

// equivalent to `IBaseWorld(_world()).registerNamespace("hello")` but directly routed through `world.call` for better gas.
worldRegistrationSystem.registerNamespace("hello");

// and makes delegation use cases easier
worldRegistrationSystem.callFrom(_msgSender()).registerNamespace("hello");
```
