---
"@latticexyz/cli": minor
"@latticexyz/world": major
---

`WorldFactory` now expects a user-provided `salt` when calling `deployWorld(...)` (instead of the previous globally incrementing counter). This enables deterministic world addresses across different chains.

When using `mud deploy`, you can provide a `bytes32` hex-encoded salt using the `--salt` option, otherwise it defaults to a random hex value.
