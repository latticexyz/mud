---
"@latticexyz/cli": patch
---

Refactored package to use the new Store/World configs under the hood, removing compatibility layers.

Removed `--srcDir` option from all commands in favor of using `sourceDirectory` in the project's MUD config.
