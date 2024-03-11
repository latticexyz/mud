---
"@latticexyz/store-sync": patch
---

Fixes an issue with Zustand store sync where multiple updates to a record for a key in the same block did not get tracked and applied properly.
