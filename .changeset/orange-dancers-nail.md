---
"@latticexyz/config": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

Tables and systems in config output now include a `label` property. Labels are now used throughout the codebase as a user-friendly way to reference the given resource: config keys, contract names, generated libraries, etc.

We'll no longer transform config keys for tables and systems and their filenames will always correspond to their labels. This should make MUD tooling more intuitive and predictable.

Labels replace the previous resource `name` usage, which is truncated to `bytes16` to be used as part of the resource ID and, in the future, may not always be human-readable.

These labels will soon be registered onchain so that developers can initialize a new MUD project from an existing world, generating config and interfaces with user-friendly names.
