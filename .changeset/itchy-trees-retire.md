---
"@latticexyz/explorer": patch
---

Migrated the World Explorer CLI to yargs to resolve the issue with the worldAddress option, which was being incorrectly interpreted as a number rather than a hexadecimal value.
