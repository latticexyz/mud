---
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/store": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": patch
"create-mud": patch
---

Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
