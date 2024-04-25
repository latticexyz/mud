---
"@latticexyz/world": minor
---

It is now possible for namespace owners to register a fallback delegation control system for the namespace.
This fallback delegation control system is used to verify a delegation in `IBaseWorld.callFrom`, after the user's individual and fallback delegations have been checked.

```solidity
IBaseWorld {
  function registerNamespaceDelegation(
    ResourceId namespaceId,
    ResourceId delegationControlId,
    bytes memory initCallData
  ) external;
}
```
