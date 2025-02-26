---
"@latticexyz/entrykit": patch
---

The session client's world address (used for delegations and `callFrom`) is now available via `sesssionClient.worldAddress`.

The local signer is also available via `sesssionClient.internal_signer`. This is marked as internal for now as we may change how this is exposed.

Using the signer allows for [Sign-in with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) and similar flows that avoid prompting the wallet for a signature, but can be validated via the associated session account <> user account delegation in the world.
