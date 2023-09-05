---
"@latticexyz/world": minor
---

It is now possible to upgrade systems by calling `registerSystem` again with an existing system id (resource selector).

```solidity
// Register a system
world.registerSystem(systemId, systemAddress, publicAccess);

// Upgrade the system by calling `registerSystem` with the
// same system id but a new system address or publicAccess flag
world.registerSystem(systemId, newSystemAddress, newPublicAccess);
```
