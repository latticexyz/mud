---
"@latticexyz/store": patch
---

Fixed a race condition when registering core tables, where we would set a record in the `ResourceIds` table before the table was registered.
