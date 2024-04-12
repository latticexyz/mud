---
"@latticexyz/world-modules": patch
---

Moved the chain ID in `CallWithSignature` from the `domain.chainId` to the `domain.salt` field to allow for cross-chain signing without requiring wallets to switch networks. The value of this field should be the chain on which the world lives, rather than the chain the wallet is connected to.
