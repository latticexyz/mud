---
"@latticexyz/world": patch
---

`IWorldKernel` now inherits `IModuleErrors` so it can render the correct errors if the World reverts when delegatecalled with Module code.
