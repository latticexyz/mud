---
"@latticexyz/cli": patch
---

Added a non-deterministic fallback for deploying to chains that have replay protection on and do not support pre-EIP-155 transactions (no chain ID).

If you're using `mud deploy` and there's already a [deterministic deployer](https://github.com/Arachnid/deterministic-deployment-proxy) on your target chain, you can provide the address with `--deployerAddress 0x...`.
