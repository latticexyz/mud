---
"@latticexyz/store": patch
---

Fixes the functions in `StoreCore` to emit a storage event after calling the `beforeSetRecord` hook, ensuring that storage events are emitted in the same order that values are set on-chain.
