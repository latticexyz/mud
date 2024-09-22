---
"@latticexyz/common": patch
"@latticexyz/store-sync": patch
---

Removed unused generics and ensure that we're only passing around the generics we need, when we need them. Hopefully this improves TS performance in MUD projects.
