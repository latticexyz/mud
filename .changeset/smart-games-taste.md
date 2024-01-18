---
"@latticexyz/world": patch
---

Prevented invalid delegations by performing full validation regardless of whether `initCallData` is empty. Added an `unregisterDelegation` function which allows explicit unregistration, as opposed of passing in zero bytes into `registerDelegation`.
