---
"@latticexyz/world": major
---

All `World` methods now revert if the `World` calls itself.
The `World` should never need to externally call itself, since all internal table operations happen via library calls, and all root system operations happen via delegate call.

It should not be possible to make the `World` call itself as an external actor.
If it were possible to make the `World` call itself, it would be possible to write to internal tables that only the `World` should have access to.
As this is a very important invariance, we made it explicit in a requirement check in every `World` method, rather than just relying on making it impossible to trigger the `World` to call itself.

This is a breaking change for modules that previously used external calls to the `World` in the `installRoot` method.
In the `installRoot` method, the `World` can only be called via `delegatecall`, and table operations should be performed via the internal table methods (e.g. `_set` instead of `set`).

Example for how to replace external calls to `world` in root systems / root modules (`installRoot`) with `delegatecall`:

```diff
+ import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

- world.grantAccess(tableId, address(hook));
+ (bool success, bytes memory returnData) = address(world).delegatecall(
+   abi.encodeCall(world.grantAccess, (tableId, address(hook)))
+ );

+ if (!success) revertWithBytes(returnData);
```
