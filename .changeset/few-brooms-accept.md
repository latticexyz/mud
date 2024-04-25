---
"@latticexyz/common": minor
---

- Added a `sendTransaction` helper to mirror viem's `sendTransaction`, but with our nonce manager
- Added an internal mempool queue to `sendTransaction` and `writeContract` for better nonce handling
- Defaults block tag to `pending` for transaction simulation and transaction count (when initializing the nonce manager)
