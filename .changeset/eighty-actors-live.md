---
"@latticexyz/store-indexer": patch
---

Added support for an empty `STORE_ADDRESS=` environment variable.
This previously would fail the input validation, now it behaves the same way as not setting the `STORE_ADDRESS` variable at all.
