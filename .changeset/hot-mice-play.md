---
"@latticexyz/cli": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
---

The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
This significantly reduces gas cost in all table library functions.
