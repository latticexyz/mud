---
"@latticexyz/store-sync": patch
---

Fixed `syncToZustand` types so that non-existent tables give an error and `never` type instead of a generic `Table` type.
