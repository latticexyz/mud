---
"@latticexyz/world-consumer": patch
"@latticexyz/world-module-erc20": patch
---

Renamed `store-consumer` package to `world-consumer`. The `world-consumer` package now only includes a single `WorldConsumer` contract that always attaches to a World.
The `world-module-erc20` package was updated to reflect this refactor.
