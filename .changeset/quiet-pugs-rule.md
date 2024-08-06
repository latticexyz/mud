---
"@latticexyz/world": patch
---

Added `deploy` config options to systems in the MUD config:

- `disabled` to toggle deploying the system (defaults to `false`)
- `registerWorldFunctions` to toggle registering namespace-prefixed system functions on the world (defaults to `true`)

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  systems: {
    HiddenSystem: {
      deploy: {
        registerWorldFunctions: false,
      },
    },
  },
});
```
