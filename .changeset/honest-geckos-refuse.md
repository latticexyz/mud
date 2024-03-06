---
"@latticexyz/store": patch
---

Updated codegen to not render `push` and `pop` methods for static arrays. The `length` method now returns the hardcoded known length instead of calculating it like with a dynamic array.
