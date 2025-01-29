---
"@latticexyz/world": patch
---

Using `encodeSystemCall` (and others) with a world ABI and namespace-prefixed function name will now attempt to strip the prefix when encoding it as a system call.

It's recommended to use a system ABI with these functions rather than a world ABI.

```ts
import systemAbi from "contracts/out/ISomeSystem.sol/ISomeSystem.sol.abi.json";
encodeSystemCall({ abi: systemAbi, ... });
```
