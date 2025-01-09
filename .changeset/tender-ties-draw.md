---
"@latticexyz/common": patch
---

Loosened `publicClient` type for `transactionQueue` action decorator and `writeContract` and `sendTransaction` actions so that they can be used with plain, undecorated Viem clients.
