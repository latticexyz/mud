---
"@latticexyz/store": patch
---

Added a check to `registerTable` that namespace and name are unique, which prevents registering both an offchain and onchain table with the same namespace and name, and makes indexing with decoded tables easier.
