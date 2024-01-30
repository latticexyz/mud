---
"@latticexyz/cli": patch
---

Fixed registration of world signatures/selectors for namespaced systems. We changed these signatures in [#2160](https://github.com/latticexyz/mud/pull/2160), but missed updating part of the deploy step.
