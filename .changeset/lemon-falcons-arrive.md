---
"@latticexyz/store": minor
---

Restored `Bytes.sliceN` helpers that were previously (mistakenly) removed and renamed them to `Bytes.getBytesN`.

If you're upgrading an existing MUD project, you can rerun codegen with `mud build` to update your table libraries to the new function names.
