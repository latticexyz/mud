---
"create-mud": minor
---

Templates now use `out` for their `forge build` artifacts, including ABIs. If you have a project created from a previous template, you can update your `packages/contracts/package.json` with:

```diff
- "build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
- "build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
+ "build:abi": "forge clean && forge build --skip test script",
+ "build:abi-ts": "mud abi-ts && prettier --write '**/*.abi.json.d.ts'",
```

And your `packages/client/src/mud/setupNetwork` with:

```diff
- import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";
+ import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
```
