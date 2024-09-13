---
"@latticexyz/common": patch
---

To reset an account's nonce, the nonce manager uses the [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount) RPC method,
which returns the number of transactions sent from the account.
When using the `pending` block tag, this includes transactions in the mempool that have not been included in a block yet.
If an account submits a transaction with a nonce higher than the next valid nonce, this transaction will stay in the mempool until the nonce gap is closed and the transactions nonce is the next valid nonce.
This means if an account has gapped transactions "stuck in the mempool", the `eth_getTransactionCount` method with `pending` block tag can't be used to get the next valid nonce
(since it includes the number of transactions stuck in the mempool).
Since the nonce manager only resets the nonce on reload or in case of a nonce error, using the `latest` block tag by default is the safer choice to be able to recover from nonce gaps.
