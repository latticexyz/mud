---
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
---

All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.
