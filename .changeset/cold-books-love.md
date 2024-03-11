---
"@latticexyz/common": patch
---

`waitForIdle` now falls back to `setTimeout` for environments without `requestIdleCallback`.
