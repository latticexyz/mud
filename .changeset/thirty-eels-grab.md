---
"@latticexyz/cli": patch
---

Added a `mud pull` command that downloads state from an existing world and uses it to generate a MUD config with tables and system interfaces. This makes it much easier to extend worlds.

```
mud pull --worldAddress 0x… --rpc https://…
```
