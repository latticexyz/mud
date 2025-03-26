---
"@latticexyz/store-sync": patch
---

`getWorldAbi` now returns a full world ABI (errors, parameter names, mutability, etc.) registered by the deployer using the metadata module.

Also added internal functions `getSystemAbi` and `getSystemAbis` to retrieve system-specific ABIs.
