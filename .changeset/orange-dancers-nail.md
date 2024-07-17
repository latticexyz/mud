---
"@latticexyz/config": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

Tables in config output now include a `label` property that represents the label of the table in the config (i.e. key under `tables` config option).
The table `name` now represents the `bytes16 name` part of the resource ID (and `tableId`) that gets registered onchain and can be overridden with the `name` table config option.

Table labels are now used throughout the codebase to generate table libraries, etc. These labels will soon be registered onchain so that developers can initialize a new MUD project from an existing world using state from the chain.
