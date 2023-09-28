---
"@latticexyz/world": minor
---

The `World` now has a `callBatch` method which allows multiple system calls to be batched into a single transaction.

```solidity
import { SystemCallData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```
