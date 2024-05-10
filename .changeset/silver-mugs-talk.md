---
"@latticexyz/store-sync": patch
---

Both `encodeEntity` and `decodeEntity` now use an LRU cache to avoid repeating work during iterations of thousands of entities.
