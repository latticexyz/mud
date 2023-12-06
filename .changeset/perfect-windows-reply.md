---
"@latticexyz/store": patch
---

Added a custom error `Store_IndexOutOfBounds` for when the `start:end` slice in `getDynamicFieldSlice` is invalid (it used to revert with the default overflow error)
