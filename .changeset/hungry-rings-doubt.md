---
"@latticexyz/store": patch
---

Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).
