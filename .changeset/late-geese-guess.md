---
"@latticexyz/world": major
---

The `SnapSyncModule` is removed. The recommended way of loading the initial state of a MUD app is via the new [`store-indexer`](https://mud.dev/indexer). Loading state via contract getter functions is not recommended, as it's computationally heavy on the RPC, can't be cached, and is an easy way to shoot yourself in the foot with exploding RPC costs.

The `@latticexyz/network` package was deprecated and is now removed. All consumers should upgrade to the new sync stack from `@latticexyz/store-sync`.
