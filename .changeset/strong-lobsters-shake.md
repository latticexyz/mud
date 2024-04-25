---
"@latticexyz/store": patch
---

Added a check to `registerTable` that prevents registering both an offchain and onchain table with the same name, making it easier to use human-readable names in indexers.
