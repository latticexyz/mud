---
"@latticexyz/world": patch
---

`callFrom` decorator now accepts any `Client`, not just a `WalletClient`. It also no longer attempts to wrap/redirect calls to `call`, `callFrom`, and `registerDelegationWithSignature`.
