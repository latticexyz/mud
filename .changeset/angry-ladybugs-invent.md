---
"@latticexyz/cli": patch
"@latticexyz/store": major
"@latticexyz/world-modules": patch
"@latticexyz/world": patch
"create-mud": patch
---

Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

If you are sure you need to manually specify a store when interacting with tables, you can still manually toggle it back on with `storeArgument: true` in the table settings of your MUD config.

If you want to use table libraries in `PostDeploy.s.sol`, you can add the following lines:

```diff
  import { Script } from "forge-std/Script.sol";
  import { console } from "forge-std/console.sol";
  import { IWorld } from "../src/codegen/world/IWorld.sol";
+ import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

  contract PostDeploy is Script {
    function run(address worldAddress) external {
+     StoreSwitch.setStoreAddress(worldAddress);
+
+     SomeTable.get(someKey);
```
