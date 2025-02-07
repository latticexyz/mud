---
"@latticexyz/world": patch
---

Added system libraries for World systems for easier ergonomics when interacting with core systems.

```solidity
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/systems/WorldRegistrationSystemLib.sol";

// equivalent to `IBaseWorld(_world()).registerNamespace("hello")` but directly routed through `world.call` for better gas.
worldRegistrationSystem.registerNamespace("hello");

// and makes delegation use cases easier
worldRegistrationSystem.callFrom(_msgSender()).registerNamespace("hello");
```
