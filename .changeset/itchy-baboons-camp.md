---
"@latticexyz/world-modules": patch
---

Moved the chain ID in `CallWithSignature` from the `chainId` to the `salt` field, preventing wallets from attempting to switch networks based on the messages chain.
