---
"@latticexyz/cli": patch
"@latticexyz/world": patch
---

MUD config now supports a `deploy.customWorld` option that, when used with the CLI, will deploy the specified custom World implementation.
Custom implementations must still follow [the World protocol](https://github.com/latticexyz/mud/tree/main/packages/world/ts/protocol-snapshots).

If you want to extend the world with new functions or override existing registered functions, we recommend using [root systems](https://mud.dev/world/systems#root-systems).
However, there are rare cases where this may not be enough to modify the native/internal World behavior.
Note that deploying a custom World opts out of the world factory, deterministic world deploys, and upgradeable implementation proxy.

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  customWorld: {
    // path to custom world source from project root
    sourcePath: "src/CustomWorld.sol",
    // custom world contract name
    name: "CustomWorld",
  },
});
```
