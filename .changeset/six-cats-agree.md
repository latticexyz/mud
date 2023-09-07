---
"@latticexyz/abi-ts": minor
"@latticexyz/cli": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
"create-mud": minor
---

Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere. It's also bundled into `@latticexyz/cli` under the `mud abi-ts` command.

If you have a MUD project created from an older template, you can replace TypeChain with `abi-ts` by first updating your contracts' `package.json`:

```diff
-"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:typechain",
+"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:abi-ts",
-"build:abi": "forge clean && forge build",
+"build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
+"build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
 "build:mud": "mud tablegen && mud worldgen",
-"build:typechain": "rimraf types && typechain --target=ethers-v5 out/IWorld.sol/IWorld.json",
```

And update your client's `setupNetwork.ts` with:

```diff
-import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
+import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";

 const worldContract = createContract({
   address: networkConfig.worldAddress as Hex,
-  abi: IWorld__factory.abi,
+  abi: IWorldAbi,
```

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
