---
"@latticexyz/common": patch
---

Moved the transaction simulation step to just before sending the transaction in our transaction queue actions (`sendTransaction` and `writeContract`).

This helps avoid cascading transaction failures for deep queues or when a transaction succeeding depends on the value of the previous.
