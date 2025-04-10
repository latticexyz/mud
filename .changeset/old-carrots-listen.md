---
"@latticexyz/store-sync": patch
---

`getWorldAbi()` now returns an ABI that is a combination of:

- base World ABI
- system ABIs stored onchain with metadata module during deploy
- world functions
