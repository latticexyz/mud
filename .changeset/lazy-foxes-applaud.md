---
"@latticexyz/world": patch
---

Systems are expected to be always called via the central World contract.
Depending on whether it is a root or non-root system, the call is performed via `delegatecall` or `call`.
Since Systems are expected to be stateless and only interact with the World state, it is not necessary to prevent direct calls to the systems.
However, since the `CoreSystem` is known to always be registered as a root system in the World, it is always expected to be delegatecalled,
so we made this expectation explicit by reverting if it is not delegatecalled.
