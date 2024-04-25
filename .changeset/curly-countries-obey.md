---
"@latticexyz/cli": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": major
---

Tables and interfaces in the `world` package are now generated to the `codegen` folder.
This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

```
