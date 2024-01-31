---
"@latticexyz/common": major
---

Add utils for using viem with MUD

- `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
- `createNonceManager` helps track local nonces, used by `createContract`.

Also renames `mudTransportObserver` to `transportObserver`.
