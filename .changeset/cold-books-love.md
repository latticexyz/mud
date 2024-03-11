---
"@latticexyz/common": patch
---

Fixed `waitForIdle` to fall back to `setTimeout` for environments without `requestIdleCallback`.
