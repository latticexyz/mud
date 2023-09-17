---
"@latticexyz/cli": major
"@latticexyz/store": major
"create-mud": patch
---

Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

Both can be overridden via the MUD config:

```ts
export default mudConfig({
  /** Filename where common user types will be generated and imported from. */
  userTypesFilename: "common.sol",
  /** Filename where codegen index will be generated. */
  codegenIndexFilename: "index.sol"
});
```

Note: `userTypesFilename` was renamed from `userTypesPath` and `.sol` is not appended automatically anymore but needs to be part of the provided filename.

To update your existing project, update all imports from `Tables.sol` to `index.sol` and all imports from `Types.sol` to `common.sol`, or override the defaults in your MUD config to the previous values.

```diff
- import { Counter } from "../src/codegen/Tables.sol";
+ import { Counter } from "../src/codegen/index.sol";
- import { ExampleEnum } from "../src/codegen/Types.sol";
+ import { ExampleEnum } from "../src/codegen/common.sol";
```
