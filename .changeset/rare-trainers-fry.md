---
"@latticexyz/world": minor
---

It is now possible to transfer ownership of namespaces!

```solidity
// Register a new namespace
world.registerNamespace("namespace");
// It's owned by the caller of the function (address(this))

// Transfer ownership of the namespace to address(42)
world.transferOwnership("namespace", address(42));
// It's now owned by address(42)
```
