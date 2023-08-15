---
"@latticexyz/block-logs-stream": major
---

- removes our own `getLogs` function now that viem's `getLogs` supports using multiple `events` per RPC call.
- removes `isNonPendingBlock` and `isNonPendingLog` helpers now that viem narrows `Block` and `Log` types based on inputs
