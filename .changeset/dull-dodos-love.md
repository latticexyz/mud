---
"@latticexyz/cli": patch
"@latticexyz/faucet": patch
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
"@latticexyz/world-modules": patch
---

Upgrade `zod` to `^3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).
