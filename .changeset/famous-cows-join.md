---
"@latticexyz/entrykit": patch
---

The session client/account's local signer is now available via `sesssionClient.internal_signer`. This is marked as internal for now as we may change how this is exposed.

Using the signer allows for [Sign-in with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) flow that avoid prompting the wallet for a signature but can validate via the associated user address and signer's delegation.
