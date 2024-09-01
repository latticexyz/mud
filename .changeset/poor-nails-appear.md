---
"@latticexyz/common": patch
---

`writeContract` and `sendTransaction` actions now use `pending` block tag when estimating gas. This aligns with previous behavior before changes in the last version.
