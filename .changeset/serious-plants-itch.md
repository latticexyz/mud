---
"@latticexyz/world": major
---

- `IBaseWorld` now has a `batchCallFrom` method, which allows system calls via `callFrom` to be executed in batch.

```solidity
import { SystemCallFromData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function batchCallFrom(SystemCallFromData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

- The `callBatch` method of `IBaseWorld` has been renamed to `batchCall` to align better with the `batchCallFrom` method.

```diff
interface IBaseWorld {
- function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
+ function batchCall(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

