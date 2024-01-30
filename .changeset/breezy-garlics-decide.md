---
"@latticexyz/world-modules": patch
---

Removed `IUniqueEntitySystem` in favor of calling `getUniqueEntity` via `world.call` instead of the world function selector. This had a small gas improvement.
