---
"@latticexyz/store": major
"@latticexyz/world": major
---

Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

```diff
- import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
+ import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
```

`MudTest.sol` was also moved to the World package. You can update your import like:

```diff
- import { MudTest } from "@latticexyz/store/src/MudTest.sol";
+ import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
```
