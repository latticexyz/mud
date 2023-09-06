---
"@latticexyz/abi-ts": minor
"@latticexyz/cli": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
"create-mud": minor
---

Added a new `@latticexyz/abi-type` package to generate TS-friendly (`as const`) ABI files from forge ABI output. This replaces our usage TypeChain everywhere. It's also bundled into `@latticexyz/cli` under the `mud abi-ts` command.

If you have a MUD project created from an older template, you can replace TypeChain with `abi-ts` by first updating your contracts' `package.json`:

```diff
-"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:typechain",
+"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:ts",
-"build:abi": "forge clean && forge build",
+"build:abi": "forge clean && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
 "build:mud": "mud tablegen && mud worldgen",
-"build:typechain": "rimraf types && typechain --target=ethers-v5 out/IWorld.sol/IWorld.json",
+"build:ts": "rimraf abi-ts && mud abi-ts --input abi --output abi-ts && prettier --write 'abi-ts/**/*.ts'",
```

And update your client's `setupNetwork.ts` with:

```diff
-import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
+import IWorldAbi from "contracts/abi-ts/IWorld.sol/IWorld";

 const worldContract = createContract({
   address: networkConfig.worldAddress as Hex,
-  abi: IWorld__factory.abi,
+  abi: IWorldAbi,
```
