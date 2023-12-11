---
"@latticexyz/store-indexer": patch
---

Disabled prepared statements for the postgres indexer, which led to issues in combination with `pgBouncer`.
