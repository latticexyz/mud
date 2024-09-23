# Change Log

## 2.2.8

### Patch Changes

- Updated dependencies [7c7bdb2]
  - @latticexyz/common@2.2.8
  - @latticexyz/config@2.2.8
  - @latticexyz/store@2.2.8
  - @latticexyz/world@2.2.8
  - @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/world@2.2.7
  - @latticexyz/common@2.2.7
  - @latticexyz/config@2.2.7
  - @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/common@2.2.6
- @latticexyz/config@2.2.6
- @latticexyz/schema-type@2.2.6
- @latticexyz/store@2.2.6
- @latticexyz/world@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/common@2.2.5
- @latticexyz/config@2.2.5
- @latticexyz/schema-type@2.2.5
- @latticexyz/store@2.2.5
- @latticexyz/world@2.2.5

## 2.2.4

### Patch Changes

- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
- Updated dependencies [1f24978]
  - @latticexyz/common@2.2.4
  - @latticexyz/config@2.2.4
  - @latticexyz/schema-type@2.2.4
  - @latticexyz/store@2.2.4
  - @latticexyz/world@2.2.4

## 2.2.3

### Patch Changes

- Updated dependencies [8546452]
  - @latticexyz/world@2.2.3
  - @latticexyz/common@2.2.3
  - @latticexyz/config@2.2.3
  - @latticexyz/schema-type@2.2.3
  - @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/common@2.2.2
- @latticexyz/config@2.2.2
- @latticexyz/schema-type@2.2.2
- @latticexyz/store@2.2.2
- @latticexyz/world@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [c0764a5]
  - @latticexyz/common@2.2.1
  - @latticexyz/config@2.2.1
  - @latticexyz/store@2.2.1
  - @latticexyz/world@2.2.1
  - @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [69cd0a1]
- Updated dependencies [04c675c]
- Updated dependencies [04c675c]
  - @latticexyz/common@2.2.0
  - @latticexyz/config@2.2.0
  - @latticexyz/store@2.2.0
  - @latticexyz/world@2.2.0
  - @latticexyz/schema-type@2.2.0

## 2.1.1

### Patch Changes

- 6435481: Upgrade `zod` to `3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).
- 6a66f57: Refactored `AccessControl` library exported from `@latticexyz/world` to be usable outside of the world package and updated module packages to use it.
- Updated dependencies [9e21e42]
- Updated dependencies [6a66f57]
- Updated dependencies [86a8104]
- Updated dependencies [2daaab1]
- Updated dependencies [542ea54]
- Updated dependencies [57bf8c3]
  - @latticexyz/common@2.1.1
  - @latticexyz/config@2.1.1
  - @latticexyz/schema-type@2.1.1
  - @latticexyz/store@2.1.1
  - @latticexyz/world@2.1.1

## 2.1.0

### Patch Changes

- 3cbbc62: Moved build scripts to `mud build` now that CLI doesn't depend on this package.

  Removed generated world interfaces as this package isn't meant to be used as a "world", but as a set of individual modules.

- e49059f: Bumped `glob` dependency.
- Updated dependencies [24e285d]
- Updated dependencies [570086e]
- Updated dependencies [7129a16]
- Updated dependencies [3cbbc62]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [a10b453]
- Updated dependencies [69eb63b]
- Updated dependencies [e49059f]
- Updated dependencies [8d0453e]
- Updated dependencies [fb1cfef]
  - @latticexyz/store@2.1.0
  - @latticexyz/world@2.1.0
  - @latticexyz/config@2.1.0
  - @latticexyz/common@2.1.0
  - @latticexyz/schema-type@2.1.0

## 2.0.12

### Patch Changes

- 36c8b5b24: Fixed `ERC20Module` to register the `TotalSupply` table when creating a new token.

  If you've deployed a world with the `ERC20Module`, we recommend patching your world to register this table so that indexers can properly decode its record. You can do so with a simple Forge script:

  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.24;

  import { Script } from "forge-std/Script.sol";
  import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
  import { TotalSupply } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/TotalSupply.sol";
  import { _totalSupplyTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";

  contract RegisterTotalSupply is Script {
    function run(address worldAddress, string memory namespaceString) external {
      bytes14 namespace = bytes14(bytes(namespaceString));

      StoreSwitch.setStoreAddress(worldAddress);

      uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
      vm.startBroadcast(deployerPrivateKey);

      TotalSupply.register(_totalSupplyTableId(namespace));

      vm.stopBroadcast();
    }
  }
  ```

  Then execute the transactions by running the following [`forge script`](https://book.getfoundry.sh/reference/forge/forge-script?highlight=script#forge-script) command:

  ```shell
  forge script ./script/RegisterTotalSupply.s.sol --sig "run(address,string)" $WORLD_ADDRESS $NAMESPACE_STRING
  ```

- 96e7bf430: TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

  If you have a MUD project that you're upgrading, we suggest adding a `tsconfig.json` file to your project workspace that extends this base config.

  ```sh
  pnpm add -D @latticexyz/common
  echo "{\n  \"extends\": \"@latticexyz/common/tsconfig.base.json\"\n}" > tsconfig.json
  ```

  Then in each package of your project, inherit from your workspace root's config.

  For example, your TS config in `packages/contracts/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json"
  }
  ```

  And your TS config in `packages/client/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "types": ["vite/client"],
      "target": "ESNext",
      "lib": ["ESNext", "DOM"],
      "jsx": "react-jsx",
      "jsxImportSource": "react"
    },
    "include": ["src"]
  }
  ```

  You may need to adjust the above configs to include any additional TS options you've set. This config pattern may also reveal new TS errors that need to be fixed or rules disabled.

  If you want to keep your existing TS configs, we recommend at least updating your `moduleResolution` setting.

  ```diff
  -"moduleResolution": "node"
  +"moduleResolution": "Bundler"
  ```

- Updated dependencies [c10c9fb2d]
- Updated dependencies [c10c9fb2d]
- Updated dependencies [9be2bb863]
- Updated dependencies [96e7bf430]
  - @latticexyz/store@2.0.12
  - @latticexyz/world@2.0.12
  - @latticexyz/common@2.0.12
  - @latticexyz/config@2.0.12
  - @latticexyz/schema-type@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/common@2.0.11
- @latticexyz/config@2.0.11
- @latticexyz/schema-type@2.0.11
- @latticexyz/store@2.0.11
- @latticexyz/world@2.0.11

## 2.0.10

### Patch Changes

- 4e4e9104: Removed the unused `ejs` dependency.
- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- Updated dependencies [a1b1ebf6]
- Updated dependencies [4e4e9104]
- Updated dependencies [4e4e9104]
- Updated dependencies [51b137d3]
- Updated dependencies [3dbf3bf3]
- Updated dependencies [32c1cda6]
- Updated dependencies [4caca05e]
- Updated dependencies [27f888c7]
  - @latticexyz/world@2.0.10
  - @latticexyz/store@2.0.10
  - @latticexyz/common@2.0.10
  - @latticexyz/config@2.0.10
  - @latticexyz/schema-type@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9
  - @latticexyz/config@2.0.9
  - @latticexyz/store@2.0.9
  - @latticexyz/world@2.0.9
  - @latticexyz/schema-type@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/config@2.0.8
  - @latticexyz/store@2.0.8
  - @latticexyz/world@2.0.8
  - @latticexyz/schema-type@2.0.8

## 2.0.7

### Patch Changes

- 78a94d71: Fixed ERC721 module to properly encode token ID as part of token URI.
- 2c9b16c7: Replaced the `systemId` field in the `Unstable_CallWithSignatureSystem` typehash with individual `systemNamespace` and `systemName` string fields.
- Updated dependencies [375d902e]
- Updated dependencies [38c61158]
- Updated dependencies [3d1d5905]
- Updated dependencies [ed404b7d]
- Updated dependencies [2c9b16c7]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/world@2.0.7
  - @latticexyz/store@2.0.7
  - @latticexyz/config@2.0.7
  - @latticexyz/schema-type@2.0.7

## 2.0.6

### Patch Changes

- 96e82b7f: Moved the chain ID in `CallWithSignature` from the `domain.chainId` to the `domain.salt` field to allow for cross-chain signing without requiring wallets to switch networks. The value of this field should be the chain on which the world lives, rather than the chain the wallet is connected to.
- Updated dependencies [6c8ab471]
- Updated dependencies [103db6ce]
- Updated dependencies [9720b568]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6
  - @latticexyz/store@2.0.6
  - @latticexyz/world@2.0.6
  - @latticexyz/config@2.0.6
  - @latticexyz/schema-type@2.0.6

## 2.0.5

### Patch Changes

- e2e8ec8b: Added missing system interfaces for ERC721, UniqueEntity, and CallWithSignature modules.
- 081c3967: Added `validateCallWithSignature` function to `Unstable_CallWithSignatureModule` to validate a signature without executing the call.
- e3c3a118: Exported mud config as internal.
- d02efd80: Replaced the `Unstable_DelegationWithSignatureModule` preview module with a more generalized `Unstable_CallWithSignatureModule` that allows making arbitrary calls (similar to `callFrom`).

  This module is still marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

- Updated dependencies [a9e8a407]
- Updated dependencies [b798ccb2]
- Updated dependencies [d02efd80]
  - @latticexyz/common@2.0.5
  - @latticexyz/store@2.0.5
  - @latticexyz/world@2.0.5
  - @latticexyz/config@2.0.5
  - @latticexyz/schema-type@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/config@2.0.4
  - @latticexyz/store@2.0.4
  - @latticexyz/world@2.0.4
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/world@2.0.3
  - @latticexyz/config@2.0.3
  - @latticexyz/store@2.0.3
  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- e86bd14d: Added a new preview module, `Unstable_DelegationWithSignatureModule`, which allows registering delegations with a signature.

  Note: this module is marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

- Updated dependencies [e86bd14d]
- Updated dependencies [a09bf251]
  - @latticexyz/world@2.0.2
  - @latticexyz/common@2.0.2
  - @latticexyz/config@2.0.2
  - @latticexyz/schema-type@2.0.2
  - @latticexyz/store@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/world@2.0.1
  - @latticexyz/common@2.0.1
  - @latticexyz/config@2.0.1
  - @latticexyz/schema-type@2.0.1

## 2.0.0

### Major Changes

- 865253dba: Refactored `InstalledModules` to key modules by addresses instead of pre-defined names. Previously, modules could report arbitrary names, meaning misconfigured modules could be installed under a name intended for another module.
- aabd30767: Bumped Solidity version to 0.8.24.
- 6ca1874e0: Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

  This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.

- 251170e1e: All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
  If you're using the MUD CLI, the import is already updated and no changes are necessary.
- 252a1852: Migrated to new config format.

### Minor Changes

- d7325e517: Added the `ERC721Module` to `@latticexyz/world-modules`.
  This module allows the registration of `ERC721` tokens in an existing World.

  Important note: this module has not been audited yet, so any production use is discouraged for now.

  ````solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
  import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
  import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";

  // The ERC721 module requires the Puppet module to be installed first
  world.installModule(new PuppetModule(), new bytes(0));

  // After the Puppet module is installed, new ERC721 tokens can be registered
  IERC721Mintable token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));```
  ````

- 35348f831: Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
  This allows standards like `ERC20` (that require a specific interface and events to be emitted by a unique contract) to be implemented inside a MUD World.

  The puppet serves as a proxy, forwarding all calls to the implementation system (also called the "puppet master").
  The "puppet master" system can emit events from the puppet contract.

  ```solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { createPuppet } from "@latticexyz/world-modules/src/modules/puppet/createPuppet.sol";

  // Install the puppet module
  world.installModule(new PuppetModule(), new bytes(0));

  // Register a new puppet for any system
  // The system must implement the `CustomInterface`,
  // and the caller must own the system's namespace
  CustomInterface puppet = CustomInterface(createPuppet(world, <systemId>));
  ```

- c4fc85041: Fixed `SystemSwitch` to properly call non-root systems from root systems.
- 9352648b1: Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
  This made the developer experience of calling other systems via root systems worse, since calls from root systems are executed from the context of the World.
  The recommended approach is to use `delegatecall` to the system if in the context of a root system, and an external call via the World if in the context of a non-root system.
  To bring back the developer experience of calling systems from other sysyems without caring about the context in which the call is executed, we added the `SystemSwitch` util.

  ```diff
  - // Instead of calling the system via an external call to world...
  - uint256 value = IBaseWorld(_world()).callMySystem();

  + // ...you can now use the `SystemSwitch` util.
  + // This works independent of whether used in a root system or non-root system.
  + uint256 value = abi.decode(SystemSwitch.call(abi.encodeCall(IBaseWorld.callMySystem, ()), (uint256));
  ```

  Note that if you already know your system is always executed as non-root system, you can continue to use the approach of calling other systems via the `IBaseWorld(world)`.

- 836383734: Added the `ERC20Module` to `@latticexyz/world-modules`.
  This module allows the registration of `ERC20` tokens in an existing World.

  Important note: this module has not been audited yet, so any production use is discouraged for now.

  ```solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
  import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";

  // The ERC20 module requires the Puppet module to be installed first
  world.installModule(new PuppetModule(), new bytes(0));

  // After the Puppet module is installed, new ERC20 tokens can be registered
  IERC20Mintable token = registerERC20(world, "myERC20", ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
  ```

- 3042f86e: Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

  ```diff
  -console.log(SomeTable.getKeySchema());
  +console.log(SomeTable._keySchema);

  -console.log(SomeTable.getValueSchema());
  +console.log(SomeTable._valueSchema);
  ```

- fdbba6d88: Added a new delegation control called `SystemboundDelegationControl` that delegates control of a specific system for some maximum number of calls. It is almost identical to `CallboundDelegationControl` except the delegatee can call the system with any function and args.

### Patch Changes

- 7ce82b6fc: Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

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

- a35c05ea9: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- eaa766ef7: Removed `IUniqueEntitySystem` in favor of calling `getUniqueEntity` via `world.call` instead of the world function selector. This had a small gas improvement.
- 0f27afddb: World function signatures for namespaced systems have changed from `{namespace}_{systemName}_{functionName}` to `{namespace}__{functionName}` (double underscore, no system name). This is more ergonomic and is more consistent with namespaced resources in other parts of the codebase (e.g. MUD config types, table names in the schemaful indexer).

  If you have a project using the `namespace` key in your `mud.config.ts` or are manually registering systems and function selectors on a namespace, you will likely need to codegen your system interfaces (`pnpm build`) and update any calls to these systems through the world's namespaced function signatures.

- c07fa0215: Tables and interfaces in the `world` package are now generated to the `codegen` folder.
  This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
  If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

  ```diff
  - import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
  + import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

  ```

- 4be22ba4: ERC20 and ERC721 implementations now always register the token namespace, instead of checking if it has already been registered. This prevents issues with registering the namespace beforehand, namely that only the owner of a system can create a puppet for it.
- 44236041f: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- eb384bb0e: Added `isInstalled` and `requireNotInstalled` helpers to `Module` base contract.
- 063daf80e: Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
  This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
  insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
  so that the `registerSystem`/`registerTable` transactions still went through successfully.
  To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
  Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

  Changes in consuming projects are only necessary if tables or systems are registered manually.
  If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

  ```diff
  +  world.registerNamespace(namespaceId);
     world.registerSystem(systemId, system, true);
  ```

  ```diff
  +  world.registerNamespace(namespaceId);
     MyTable.register();
  ```

- 37c228c63: Refactored `ResourceId` to use a global Solidity `using` statement.
- 37c228c63: Refactored EIP165 usages to use the built-in interfaceId property instead of pre-defined constants.
- 88b1a5a19: We now expose a `WorldContextConsumerLib` library with the same functionality as the `WorldContextConsumer` contract, but the ability to be used inside of internal libraries.
  We also renamed the `WorldContextProvider` library to `WorldContextProviderLib` for consistency.
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- e2d089c6d: Renamed the Module `args` parameter to `encodedArgs` to better reflect that it is ABI-encoded arguments.
- 1890f1a06: Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).
- 37c228c63: Refactored various Solidity files to not explicitly initialise variables to zero.
- 747d8d1b8: Renamed token address fields in ERC20 and ERC721 modules to `tokenAddress`
- 3e7d83d0: Renamed `PackedCounter` to `EncodedLengths` for consistency.
- Updated dependencies [7ce82b6fc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [77dce993a]
- Updated dependencies [ce97426c0]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [c963b46c7]
- Updated dependencies [05b3e8882]
- Updated dependencies [0f27afddb]
- Updated dependencies [748f4588a]
- Updated dependencies [865253dba]
- Updated dependencies [8f49c277d]
- Updated dependencies [7fa2ca183]
- Updated dependencies [745485cda]
- Updated dependencies [16b13ea8f]
- Updated dependencies [aea67c580]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [c07fa0215]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [6ca1874e0]
- Updated dependencies [331dbfdcb]
- Updated dependencies [d5c0682fb]
- Updated dependencies [1d60930d6]
- Updated dependencies [01e46d99]
- Updated dependencies [430e6b29a]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [2c920de7]
- Updated dependencies [b9e562d8f]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [3fb9ce283]
- Updated dependencies [c207d35e8]
- Updated dependencies [db7798be2]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [3be4deecf]
- Updated dependencies [a25881160]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [5debcca8]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [f8dab7334]
- Updated dependencies [1a0fa7974]
- Updated dependencies [f62c767e7]
- Updated dependencies [d00c4a9af]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [c32a9269a]
- Updated dependencies [eb384bb0e]
- Updated dependencies [37c228c63]
- Updated dependencies [618dd0e89]
- Updated dependencies [aacffcb59]
- Updated dependencies [c991c71a]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [e5d208e40]
- Updated dependencies [b38c096d]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [1f80a0b52]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e5a962bc3]
- Updated dependencies [331f0d636]
- Updated dependencies [f6f402896]
- Updated dependencies [d5b73b126]
- Updated dependencies [e34d1170]
- Updated dependencies [08b422171]
- Updated dependencies [b8a6158d6]
- Updated dependencies [190fdd11]
- Updated dependencies [37c228c63]
- Updated dependencies [37c228c63]
- Updated dependencies [433078c54]
- Updated dependencies [db314a74]
- Updated dependencies [b2d2aa715]
- Updated dependencies [4c7fd3eb2]
- Updated dependencies [a0341daf9]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [6573e38e9]
- Updated dependencies [51914d656]
- Updated dependencies [063daf80e]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [59267655]
- Updated dependencies [37c228c63]
- Updated dependencies [2bfee9217]
- Updated dependencies [1ca35e9a1]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [88b1a5a19]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [2ca75f9b9]
- Updated dependencies [f62c767e7]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [1a82c278]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [f1cd43bf9]
- Updated dependencies [9d0f492a9]
- Updated dependencies [55a05fd7a]
- Updated dependencies [f03531d97]
- Updated dependencies [c583f3cd0]
- Updated dependencies [31ffc9d5d]
- Updated dependencies [5e723b90e]
- Updated dependencies [63831a264]
- Updated dependencies [b8a6158d6]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [a7b30c79b]
- Updated dependencies [6470fe1fd]
- Updated dependencies [86766ce1]
- Updated dependencies [92de59982]
- Updated dependencies [5741d53d0]
- Updated dependencies [aee8020a6]
- Updated dependencies [22ee44700]
- Updated dependencies [e2d089c6d]
- Updated dependencies [ad4ac4459]
- Updated dependencies [be313068b]
- Updated dependencies [ac508bf18]
- Updated dependencies [93390d89]
- Updated dependencies [57d8965df]
- Updated dependencies [18d3aea55]
- Updated dependencies [7987c94d6]
- Updated dependencies [bb91edaa0]
- Updated dependencies [144c0d8d]
- Updated dependencies [5ac4c97f4]
- Updated dependencies [bfcb293d1]
- Updated dependencies [3e057061d]
- Updated dependencies [1890f1a06]
- Updated dependencies [e48171741]
- Updated dependencies [e4a6189df]
- Updated dependencies [9b43029c3]
- Updated dependencies [37c228c63]
- Updated dependencies [55ab88a60]
- Updated dependencies [c58da9ad]
- Updated dependencies [37c228c63]
- Updated dependencies [4e4a34150]
- Updated dependencies [535229984]
- Updated dependencies [af639a264]
- Updated dependencies [5e723b90e]
- Updated dependencies [99ab9cd6f]
- Updated dependencies [be18b75b]
- Updated dependencies [0c4f9fea9]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [17f987209]
- Updated dependencies [25086be5f]
- Updated dependencies [37c228c63]
- Updated dependencies [b1d41727d]
- Updated dependencies [3ac68ade6]
- Updated dependencies [c642ff3a0]
- Updated dependencies [22ba7b675]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [3042f86e]
- Updated dependencies [c049c23f4]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [251170e1e]
- Updated dependencies [8025c3505]
- Updated dependencies [c4f49240d]
- Updated dependencies [745485cda]
- Updated dependencies [95f64c85]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [29c3f5087]
- Updated dependencies [cea754dde]
- Updated dependencies [331f0d636]
- Updated dependencies [95c59b203]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/world@2.0.0
  - @latticexyz/common@2.0.0
  - @latticexyz/schema-type@2.0.0
  - @latticexyz/config@2.0.0

## 2.0.0-next.18

### Major Changes

- 252a1852: Migrated to new config format.

### Minor Changes

- 3042f86e: Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

  ```diff
  -console.log(SomeTable.getKeySchema());
  +console.log(SomeTable._keySchema);

  -console.log(SomeTable.getValueSchema());
  +console.log(SomeTable._valueSchema);
  ```

### Patch Changes

- 4be22ba4: ERC20 and ERC721 implementations now always register the token namespace, instead of checking if it has already been registered. This prevents issues with registering the namespace beforehand, namely that only the owner of a system can create a puppet for it.
- 44236041: Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

  ```diff
  -import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
  +import { SomeTable } from "./codegen/tables/SomeTable.sol";

  -console.log(SomeTableTableId);
  +console.log(SomeTable._tableId);

  -console.log(SomeTable.getFieldLayout());
  +console.log(SomeTable._fieldLayout);
  ```

- 3e7d83d0: Renamed `PackedCounter` to `EncodedLengths` for consistency.
- Updated dependencies [c9ee5e4a]
- Updated dependencies [8f49c277d]
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [3be4deecf]
- Updated dependencies [5debcca8]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [c991c71a]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [190fdd11]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [1a82c278]
- Updated dependencies [8193136a9]
- Updated dependencies [86766ce1]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [c58da9ad]
- Updated dependencies [be18b75b]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [95f64c85]
- Updated dependencies [3e7d83d0]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/world@2.0.0-next.18
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18
  - @latticexyz/config@2.0.0-next.18

## 2.0.0-next.17

### Major Changes

- aabd3076: Bumped Solidity version to 0.8.24.

### Minor Changes

- c4fc8504: Fixed `SystemSwitch` to properly call non-root systems from root systems.

### Patch Changes

- a35c05ea: Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.
- e2d089c6: Renamed the Module `args` parameter to `encodedArgs` to better reflect that it is ABI-encoded arguments.
- Updated dependencies [a35c05ea]
- Updated dependencies [05b3e888]
- Updated dependencies [745485cd]
- Updated dependencies [aabd3076]
- Updated dependencies [db7798be]
- Updated dependencies [618dd0e8]
- Updated dependencies [c162ad5a]
- Updated dependencies [55a05fd7]
- Updated dependencies [6470fe1f]
- Updated dependencies [e2d089c6]
- Updated dependencies [17f98720]
- Updated dependencies [5c52bee0]
- Updated dependencies [745485cd]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/store@2.0.0-next.17
  - @latticexyz/world@2.0.0-next.17
  - @latticexyz/schema-type@2.0.0-next.17
  - @latticexyz/config@2.0.0-next.17

## 2.0.0-next.16

### Major Changes

- 865253db: Refactored `InstalledModules` to key modules by addresses instead of pre-defined names. Previously, modules could report arbitrary names, meaning misconfigured modules could be installed under a name intended for another module.

### Patch Changes

- eaa766ef: Removed `IUniqueEntitySystem` in favor of calling `getUniqueEntity` via `world.call` instead of the world function selector. This had a small gas improvement.
- 0f27afdd: World function signatures for namespaced systems have changed from `{namespace}_{systemName}_{functionName}` to `{namespace}__{functionName}` (double underscore, no system name). This is more ergonomic and is more consistent with namespaced resources in other parts of the codebase (e.g. MUD config types, table names in the schemaful indexer).

  If you have a project using the `namespace` key in your `mud.config.ts` or are manually registering systems and function selectors on a namespace, you will likely need to codegen your system interfaces (`pnpm build`) and update any calls to these systems through the world's namespaced function signatures.

- 063daf80: Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
  This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
  insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
  so that the `registerSystem`/`registerTable` transactions still went through successfully.
  To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
  Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

  Changes in consuming projects are only necessary if tables or systems are registered manually.
  If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

  ```diff
  +  world.registerNamespace(namespaceId);
     world.registerSystem(systemId, system, true);
  ```

  ```diff
  +  world.registerNamespace(namespaceId);
     MyTable.register();
  ```

- 37c228c6: Refactored `ResourceId` to use a global Solidity `using` statement.
- 37c228c6: Refactored EIP165 usages to use the built-in interfaceId property instead of pre-defined constants.
- 37c228c6: Refactored various Solidity files to not explicitly initialise variables to zero.
- Updated dependencies [c6c13f2e]
- Updated dependencies [0f27afdd]
- Updated dependencies [865253db]
- Updated dependencies [e6c03a87]
- Updated dependencies [c207d35e]
- Updated dependencies [d00c4a9a]
- Updated dependencies [37c228c6]
- Updated dependencies [1bf2e908]
- Updated dependencies [f6f40289]
- Updated dependencies [08b42217]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [063daf80]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [2bfee921]
- Updated dependencies [7b28d32e]
- Updated dependencies [9f8b84e7]
- Updated dependencies [aee8020a]
- Updated dependencies [ad4ac445]
- Updated dependencies [57d8965d]
- Updated dependencies [e4a6189d]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [3ac68ade]
- Updated dependencies [c642ff3a]
- Updated dependencies [37c228c6]
- Updated dependencies [103f635e]
  - @latticexyz/store@2.0.0-next.16
  - @latticexyz/world@2.0.0-next.16
  - @latticexyz/common@2.0.0-next.16
  - @latticexyz/config@2.0.0-next.16
  - @latticexyz/schema-type@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- eb384bb0: Added `isInstalled` and `requireNotInstalled` helpers to `Module` base contract.
- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 747d8d1b: Renamed token address fields in ERC20 and ERC721 modules to `tokenAddress`
- Updated dependencies [d8c8f66b]
- Updated dependencies [1b86eac0]
- Updated dependencies [1077c7f5]
- Updated dependencies [933b54b5]
- Updated dependencies [f8dab733]
- Updated dependencies [1a0fa797]
- Updated dependencies [eb384bb0]
- Updated dependencies [e5a962bc]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [6db95ce1]
- Updated dependencies [5d737cf2]
- Updated dependencies [5ac4c97f]
- Updated dependencies [e4817174]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/store@2.0.0-next.15
  - @latticexyz/world@2.0.0-next.15
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/config@2.0.0-next.15
  - @latticexyz/schema-type@2.0.0-next.15

## 2.0.0-next.14

### Minor Changes

- fdbba6d8: Added a new delegation control called `SystemboundDelegationControl` that delegates control of a specific system for some maximum number of calls. It is almost identical to `CallboundDelegationControl` except the delegatee can call the system with any function and args.

### Patch Changes

- Updated dependencies [aacffcb5]
- Updated dependencies [b2d2aa71]
- Updated dependencies [bb91edaa]
- Updated dependencies [bb91edaa]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/store@2.0.0-next.14
  - @latticexyz/world@2.0.0-next.14
  - @latticexyz/schema-type@2.0.0-next.14
  - @latticexyz/config@2.0.0-next.14

## 2.0.0-next.13

### Minor Changes

- d7325e51: Added the `ERC721Module` to `@latticexyz/world-modules`.
  This module allows the registration of `ERC721` tokens in an existing World.

  Important note: this module has not been audited yet, so any production use is discouraged for now.

  ````solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
  import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
  import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";

  // The ERC721 module requires the Puppet module to be installed first
  world.installModule(new PuppetModule(), new bytes(0));

  // After the Puppet module is installed, new ERC721 tokens can be registered
  IERC721Mintable token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));```
  ````

- 35348f83: Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
  This allows standards like `ERC20` (that require a specific interface and events to be emitted by a unique contract) to be implemented inside a MUD World.

  The puppet serves as a proxy, forwarding all calls to the implementation system (also called the "puppet master").
  The "puppet master" system can emit events from the puppet contract.

  ```solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { createPuppet } from "@latticexyz/world-modules/src/modules/puppet/createPuppet.sol";

  // Install the puppet module
  world.installModule(new PuppetModule(), new bytes(0));

  // Register a new puppet for any system
  // The system must implement the `CustomInterface`,
  // and the caller must own the system's namespace
  CustomInterface puppet = CustomInterface(createPuppet(world, <systemId>));
  ```

- 83638373: Added the `ERC20Module` to `@latticexyz/world-modules`.
  This module allows the registration of `ERC20` tokens in an existing World.

  Important note: this module has not been audited yet, so any production use is discouraged for now.

  ```solidity
  import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
  import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
  import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";

  // The ERC20 module requires the Puppet module to be installed first
  world.installModule(new PuppetModule(), new bytes(0));

  // After the Puppet module is installed, new ERC20 tokens can be registered
  IERC20Mintable token = registerERC20(world, "myERC20", ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
  ```

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/config@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13
  - @latticexyz/world@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Major Changes

- 6ca1874e: Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

  This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.

### Patch Changes

- 7ce82b6f: Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

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

- Updated dependencies [7ce82b6f]
- Updated dependencies [7fa2ca18]
- Updated dependencies [6ca1874e]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [29c3f508]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/world@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/config@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Minor Changes

- 9352648b: Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
  This made the developer experience of calling other systems via root systems worse, since calls from root systems are executed from the context of the World.
  The recommended approach is to use `delegatecall` to the system if in the context of a root system, and an external call via the World if in the context of a non-root system.
  To bring back the developer experience of calling systems from other sysyems without caring about the context in which the call is executed, we added the `SystemSwitch` util.

  ```diff
  - // Instead of calling the system via an external call to world...
  - uint256 value = IBaseWorld(_world()).callMySystem();

  + // ...you can now use the `SystemSwitch` util.
  + // This works independent of whether used in a root system or non-root system.
  + uint256 value = abi.decode(SystemSwitch.call(abi.encodeCall(IBaseWorld.callMySystem, ()), (uint256));
  ```

  Note that if you already know your system is always executed as non-root system, you can continue to use the approach of calling other systems via the `IBaseWorld(world)`.

### Patch Changes

- Updated dependencies [16b13ea8]
- Updated dependencies [430e6b29]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/world@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/config@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- [#1624](https://github.com/latticexyz/mud/pull/1624) [`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29) Thanks [@alvrs](https://github.com/alvrs)! - We now expose a `WorldContextConsumerLib` library with the same functionality as the `WorldContextConsumer` contract, but the ability to be used inside of internal libraries.
  We also renamed the `WorldContextProvider` library to `WorldContextProviderLib` for consistency.
- Updated dependencies [[`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29), [`7987c94d`](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)]:
  - @latticexyz/world@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/config@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1591](https://github.com/latticexyz/mud/pull/1591) [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23) Thanks [@alvrs](https://github.com/alvrs)! - All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
  If you're using the MUD CLI, the import is already updated and no changes are necessary.

### Patch Changes

- [#1592](https://github.com/latticexyz/mud/pull/1592) [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07) Thanks [@alvrs](https://github.com/alvrs)! - Tables and interfaces in the `world` package are now generated to the `codegen` folder.
  This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
  If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

  ```diff
  - import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
  + import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

  ```

- [#1601](https://github.com/latticexyz/mud/pull/1601) [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70) Thanks [@alvrs](https://github.com/alvrs)! - Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

- Updated dependencies [[`77dce993`](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a), [`748f4588`](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033), [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`1f80a0b5`](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`4c7fd3eb`](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651), [`a0341daf`](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`f1cd43bf`](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203), [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`5741d53d`](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b), [`95c59b20`](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)]:
  - @latticexyz/world@2.0.0-next.9
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/config@2.0.0-next.9
