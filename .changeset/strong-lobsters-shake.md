---
"@latticexyz/store": patch
---

Added a check to `registerTable` that prevents registering both an offchain and onchain table with the same namespace and name, making indexing with decoded tables easier.
