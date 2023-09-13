---
"@latticexyz/world": minor
---

The `World` contract now stores the original creator of the `World` in an immutable state variable.
It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

```solidity
interface IBaseWorld {
  function creator() external view returns (address);
}
```
