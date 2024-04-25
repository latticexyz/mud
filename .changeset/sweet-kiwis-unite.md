---
"@latticexyz/cli": patch
---

`deploy` and `dev-contracts` CLI commands now use `forge build --skip test script` before deploying and run `mud abi-ts` to generate strong types for ABIs.
