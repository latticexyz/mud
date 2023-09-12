---
"@latticexyz/world": major
---

The World now maintains a balance table per namespace. When a system is called with value, the value stored in the World contract and credited to the system's namespace.

Previously, the World contract did not store value, but passed it on to the system contracts.
However, as systems are expected to be stateless (reading/writing state only via the calling World) and can be registered in multiple Worlds, this could have led to exploits.

Any address with access to a namespace can use the balance of that namespace.
This allows all systems registered in the same namespace to work with the same balance.

There are two new World methods to transfer balance between namespaces (`transferBalanceToNamespace`) or to an address (`transferBalanceToAddress`).

```solidity
interface IBaseWorld {
  function transferBalanceToNamespace(bytes16 fromNamespace, bytes16 toNamespace, uint256 amount) external;

  function transferBalanceToAddress(bytes16 fromNamespace, address toAddress, uint256 amount) external;

  // ...
}
```
