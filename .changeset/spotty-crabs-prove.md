---
"@latticexyz/common": patch
---

The `transactionQueue` decorator internally keeps an updated reference for the recommended `baseFeePerGas` and `maxPriorityFeePerGas` from the connected chain to avoid having to fetch it right before sending a transaction.
However, due to the way the fee values were overridden, it wasn't possible for users to explicitly pass in custom fee values.
Now explicitly provided fee values have precedence over the internally estimated fee values.
