---
"@latticexyz/world": major
---

Moves World interfaces and factories files for consistency with our other packages.

If you import any World interfaces or factories directly, you'll need to update the import path:

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/IBaseWorld.sol";
```

```diff
- import { IBaseWorld } from "@latticexyz/world/src/factories/WorldFactory.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/WorldFactory.sol";
```
