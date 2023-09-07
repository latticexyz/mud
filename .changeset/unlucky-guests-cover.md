---
"@latticexyz/store": minor
"@latticexyz/world": minor
---

We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

If you previously relied on TypeChain types from `@latticexyz/store` or `@latticexyz/world`, you will either need to migrate to viem or abitype using ABI JSON imports or generate TypeChain types from our exported ABI JSON files.

```ts
import { getContract } from "viem";
import IStoreAbi from "@latticexyz/store/abi/IStore.sol/IStore.abi.json";

const storeContract = getContract({
  abi: IStoreAbi,
  ...
});

await storeContract.write.setRecord(...);
```
