---
"@latticexyz/store-sync": patch
---

All sync methods using a `publicClient` argument now accept a plain Viem `Client` rather than a decorated `PublicClient`, allowing for more flexibility and better tree-shaking for lighter bundles.
