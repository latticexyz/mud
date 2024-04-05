---
"@latticexyz/store": patch
---

Fixed the behaviour of static arrays, so that they return zero for uninitialised values, to mirror the native Solidity behavior. Previously they reverted with `Store_IndexOutOfBounds` if the index had not been set yet.
