---
"@latticexyz/store": patch
---

Fixed `resolveUserTypes` for static arrays.
`resolveUserTypes` is used by `deploy`, which prevented deploying tables with static arrays.
