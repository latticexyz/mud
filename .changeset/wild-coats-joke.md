---
"@latticexyz/cli": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": patch
---

Replaced the `Unstable_DelegationWithSignatureModule` preview module with a more generalized `Unstable_CallWithSignatureModule` that allows making arbitrary calls (similar to `callFrom`).

This module is still marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.
