---
"@latticexyz/store-sync": patch
---

Improved `syncToZustand` speed of hydrating from snapshot by only applying block logs once per block instead of once per log.
