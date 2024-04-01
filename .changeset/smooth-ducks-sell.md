---
"@latticexyz/common": patch
---

`transactionQueue` decorator now accepts an optional `publicClient` argument, which will be used in place of the extended viem client for making public action calls (`getChainId`, `getTransactionCount`, `simulateContract`). This helps in cases where the extended viem client is a smart account client, like in [permissionless.js](https://github.com/pimlicolabs/permissionless.js), where the transport is the bundler, not an RPC.

`writeObserver` decorator now accepts any `Client`, not just a `WalletClient`.

`createBurnerAccount` now returns a `PrivateKeyAccount`, the more specific `Account` type.
