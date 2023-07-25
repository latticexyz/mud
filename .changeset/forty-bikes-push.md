---
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/store": patch
---

Refactor tightcoder to use typescript functions instead of ejs
Optimize `encode` function in generated table libraries using a new `renderEncodeRecord` codegen function
Add `isLeftAligned` and `shiftLeftBits` common codegen helpers
