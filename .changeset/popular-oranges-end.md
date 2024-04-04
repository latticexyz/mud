---
"@latticexyz/store": patch
"@latticexyz/cli": patch
---

Fixed the behaviour of static arrays, so that they always return zero for uninitialised values. Previously the would revert with `Store_IndexOutOfBounds` if they had not been set yet.
