---
"@latticexyz/world-modules": minor
---

Added a new delegation control called `SystemboundDelegationControl` that delegates control of a specific system for some maximum number of calls. It is almost identical to `CallboundDelegationControl` except the delegatee can call the system with any function and args.
