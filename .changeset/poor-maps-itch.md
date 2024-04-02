---
"@latticexyz/common": patch
---

`transactionQueue` now accepts a `queueConcurrency` to allow adjusting the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered and nonces are handled properly. Any number greater than that is likely to see nonce errors and transactions arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.
