# Change Log

## 2.0.0-next.8

### Major Changes

- [#1458](https://github.com/latticexyz/mud/pull/1458) [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac) Thanks [@alvrs](https://github.com/alvrs)! - The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

  The required `supportsInterface` methods are implemented on the respective base contracts.
  When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

  ```diff
  - import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
  + import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

  - contract MyStoreHook is IStoreHook {}
  + contract MyStoreHook is StoreHook {}
  ```

  ```diff
  - import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
  + import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

  - contract MySystemHook is ISystemHook {}
  + contract MySystemHook is SystemHook {}
  ```

  ```diff
  - import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
  + import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

  - contract MyDelegationControl is IDelegationControl {}
  + contract MyDelegationControl is DelegationControl {}
  ```

  ```diff
  - import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
  + import { Module } from "@latticexyz/world/src/Module.sol";

  - contract MyModule is IModule {}
  + contract MyModule is Module {}
  ```

### Minor Changes

- [#1422](https://github.com/latticexyz/mud/pull/1422) [`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7) Thanks [@alvrs](https://github.com/alvrs)! - It is now possible to unregister Store hooks and System hooks.

  ```solidity
  interface IStore {
    function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
    // ...
  }

  interface IWorld {
    function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
    // ...
  }
  ```

- [#1443](https://github.com/latticexyz/mud/pull/1443) [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98) Thanks [@holic](https://github.com/holic)! - Moved `KeySchema`, `ValueSchema`, `SchemaToPrimitives` and `TableRecord` types into `@latticexyz/protocol-parser`

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/config@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Major Changes

- [#1399](https://github.com/latticexyz/mud/pull/1399) [`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15) Thanks [@alvrs](https://github.com/alvrs)! - - The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

  - It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

    ```diff
    function registerStoreHook(
      bytes32 tableId,
    - IStoreHook hookAddress
    + IStoreHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;

    function registerSystemHook(
      bytes32 systemId,
    - ISystemHook hookAddress
    + ISystemHook hookAddress,
    + uint8 enabledHooksBitmap
    ) public;
    ```

    There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

    ```solidity
    import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

    uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
      onBeforeSetRecord: true,
      onAfterSetRecord: true,
      onBeforeSetField: true,
      onAfterSetField: true,
      onBeforeDeleteRecord: true,
      onAfterDeleteRecord: true
    });
    ```

    ```solidity
    import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

    uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
      onBeforeCallSystem: true,
      onAfterCallSystem: true
    });
    ```

  - The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/config@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Minor Changes

- [#1413](https://github.com/latticexyz/mud/pull/1413) [`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561) Thanks [@holic](https://github.com/holic)! - We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

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

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/config@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/config@2.0.0-next.5
  - @latticexyz/gas-report@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/config@2.0.0-next.4
  - @latticexyz/gas-report@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4

## 2.0.0-next.3

### Major Changes

- [#1174](https://github.com/latticexyz/mud/pull/1174) [`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57) Thanks [@alvrs](https://github.com/alvrs)! - All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
  This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

  ```diff
    function setRecord(
      bytes32 table,
      bytes32[] calldata key,
      bytes calldata data,
  +   Schema valueSchema
    ) external;
  ```

  The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

  This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
  so downstream projects only need to regenerate their table libraries after updating MUD.

- [#1231](https://github.com/latticexyz/mud/pull/1231) [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db) Thanks [@dk1a](https://github.com/dk1a)! - Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

- [#1182](https://github.com/latticexyz/mud/pull/1182) [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab) Thanks [@alvrs](https://github.com/alvrs)! - - `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`

  - `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

    ```diff
    -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
    -
    -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

    +  function registerTable(
    +    bytes32 table,
    +    Schema keySchema,
    +    Schema valueSchema,
    +    string[] calldata keyNames,
    +    string[] calldata fieldNames
    +  ) external;
    ```

  - `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
  - The `getSchema` method is renamed to `getValueSchema` on all interfaces
    ```diff
    - function getSchema(bytes32 table) external view returns (Schema schema);
    + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
    ```
  - The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.

### Patch Changes

- [#1303](https://github.com/latticexyz/mud/pull/1303) [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd) Thanks [@dk1a](https://github.com/dk1a)! - Optimize autogenerated table libraries

- [#1252](https://github.com/latticexyz/mud/pull/1252) [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61) Thanks [@dk1a](https://github.com/dk1a)! - Optimize Schema methods.
  Return `uint256` instead of `uint8` in SchemaInstance numFields methods
- Updated dependencies [[`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/config@2.0.0-next.3
  - @latticexyz/gas-report@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1279](https://github.com/latticexyz/mud/pull/1279) [`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062) Thanks [@dk1a](https://github.com/dk1a)! - Remove `TableId` library to simplify `store` package

### Patch Changes

- [#1278](https://github.com/latticexyz/mud/pull/1278) [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473) Thanks [@holic](https://github.com/holic)! - RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

  To migrate existing projects after upgrading to this MUD version:

  1. Remove `contractComponents.ts` from `client/src/mud`
  2. Remove `components` argument from `syncToRecs`
  3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

     ```diff
     - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
     + "build:mud": "mud tablegen && mud worldgen",
     ```

     ```diff
     - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
     + "dev": "pnpm mud dev-contracts",
     ```

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/config@2.0.0-next.2
  - @latticexyz/gas-report@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1194](https://github.com/latticexyz/mud/pull/1194) [`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021) Thanks [@dk1a](https://github.com/dk1a)! - Optimize storage library

- [#1237](https://github.com/latticexyz/mud/pull/1237) [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206) Thanks [@alvrs](https://github.com/alvrs)! - Align Store events parameter naming between IStoreWrite and StoreCore

- [#1210](https://github.com/latticexyz/mud/pull/1210) [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3) Thanks [@dk1a](https://github.com/dk1a)! - - Refactor tightcoder to use typescript functions instead of ejs
  - Optimize `TightCoder` library
  - Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers
- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/config@2.0.0-next.1
  - @latticexyz/gas-report@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1147](https://github.com/latticexyz/mud/pull/1147) [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11) Thanks [@dk1a](https://github.com/dk1a)! - Create gas-report package, move gas-report cli command and GasReporter contract to it

- [#1061](https://github.com/latticexyz/mud/pull/1061) [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda) Thanks [@dk1a](https://github.com/dk1a)! - Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

  ```solidity
  // old import
  import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
  // new import
  import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  ```

  Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

  - Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
  - With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
  - In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
  - Besides gas savings, this change has two additional benefits:
    1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
    2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.

### Patch Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1153](https://github.com/latticexyz/mud/pull/1153) [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f) Thanks [@dk1a](https://github.com/dk1a)! - Clean up Memory.sol, make mcopy pure

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/gas-report@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **cli:** account for getRecord's trimming ([#574](https://github.com/latticexyz/mud/issues/574)) ([9c5317a](https://github.com/latticexyz/mud/commit/9c5317afb2c4a9ac2fbaca424f90f30575dba671))

### Features

- add support for key schemas ([#480](https://github.com/latticexyz/mud/issues/480)) ([37aec2e](https://github.com/latticexyz/mud/commit/37aec2e0a8adf378035fa5b54d752cc6888378d2))
- **cli:** add encode function to all tables ([#498](https://github.com/latticexyz/mud/issues/498)) ([564604c](https://github.com/latticexyz/mud/commit/564604c0c03d675e007d176ec735d8fb76976771))
- **cli:** add module config to CLI ([#494](https://github.com/latticexyz/mud/issues/494)) ([263c828](https://github.com/latticexyz/mud/commit/263c828d3eb6f43d5e635c28026f4a68fbf7a19b))
- **cli:** allow static arrays as abi types in store config and tablegen ([#509](https://github.com/latticexyz/mud/issues/509)) ([588d037](https://github.com/latticexyz/mud/commit/588d0370d4c7d13667ff784ecb170edf59aa119e))
- **cli:** improve storeArgument, refactor cli ([#500](https://github.com/latticexyz/mud/issues/500)) ([bb68670](https://github.com/latticexyz/mud/commit/bb686702da75401d9ea4a8c8effcf3a15fa53b49))
- **cli:** set storeArgument to true by default ([#553](https://github.com/latticexyz/mud/issues/553)) ([cb1ecbc](https://github.com/latticexyz/mud/commit/cb1ecbcd036ead1b1ba0b717c7531d15beaeb106))
- **cli:** use a central codegen dir for tablegen and worldgen ([#585](https://github.com/latticexyz/mud/issues/585)) ([7500b11](https://github.com/latticexyz/mud/commit/7500b119d727a7155fa1033b2fc3ca729a51d033))
- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **cli:** use json for gas report output ([#607](https://github.com/latticexyz/mud/issues/607)) ([bea12ca](https://github.com/latticexyz/mud/commit/bea12cac16a2e0cdbb9623571cf0b02a5ed969a2))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
- **store:** add metadata to the schema table ([#550](https://github.com/latticexyz/mud/issues/550)) ([55ab704](https://github.com/latticexyz/mud/commit/55ab704c36a8ba5fd021cc80abb32b3f69e97b73))
- use IErrors in IStore and IWorldCore ([#573](https://github.com/latticexyz/mud/issues/573)) ([4f9ed7b](https://github.com/latticexyz/mud/commit/4f9ed7ba22ea978623b6d54e9731081580c2ad8f))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))
- **world,store:** add updateInField ([#525](https://github.com/latticexyz/mud/issues/525)) ([0ac76fd](https://github.com/latticexyz/mud/commit/0ac76fd57484f54860157b79678b8b9eb7a86997))
- **world:** add naive ReverseMappingHook/Module ([#487](https://github.com/latticexyz/mud/issues/487)) ([36aaaef](https://github.com/latticexyz/mud/commit/36aaaef3a69914b962a3ef0847aa144134e89d28))
- **world:** add support for modules, add RegistrationModule, add CoreModule ([#482](https://github.com/latticexyz/mud/issues/482)) ([624cbbc](https://github.com/latticexyz/mud/commit/624cbbc6722823e83594f3df38d72682a1cecd99))
- **world:** add UniqueEntityModule ([#552](https://github.com/latticexyz/mud/issues/552)) ([983e26a](https://github.com/latticexyz/mud/commit/983e26a0ee0c0521e99d09dd25ebb9937e7c4ded))
- **world:** allow registration of function selectors in the World, split out RegisterSystem from World ([#481](https://github.com/latticexyz/mud/issues/481)) ([ba0166f](https://github.com/latticexyz/mud/commit/ba0166fb6cd7de63ddc6f4f500ff90c05da67b09))
- **world:** simplify access control to namespaces instead of routes ([#467](https://github.com/latticexyz/mud/issues/467)) ([945f2ef](https://github.com/latticexyz/mud/commit/945f2ef4a09c2fd1f9c4bb0418a1569fc31e0776))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Bug Fixes

- **cli:** add missing await to tablegen, fix formatting ([#472](https://github.com/latticexyz/mud/issues/472)) ([4313c27](https://github.com/latticexyz/mud/commit/4313c277b10c0334716e5c3728ffeaef643c1e6b))

### Features

- add pushToField to Store and World ([#434](https://github.com/latticexyz/mud/issues/434)) ([b665efc](https://github.com/latticexyz/mud/commit/b665efcb407992779c93a400199dee8ffdc03cb7))
- **cli:** add setMetadata to autogen of table libraries ([#466](https://github.com/latticexyz/mud/issues/466)) ([1e129fe](https://github.com/latticexyz/mud/commit/1e129fe9ced354e838d3d9afc9839aba82fbf210))
- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))
- **cli:** user types and route/path separation ([#454](https://github.com/latticexyz/mud/issues/454)) ([758bf03](https://github.com/latticexyz/mud/commit/758bf0388c9e282c58b2890cadb4a59e00978d26))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- add StoreMetadata table for table name and field names to Store and World ([#428](https://github.com/latticexyz/mud/issues/428)) ([ae39ace](https://github.com/latticexyz/mud/commit/ae39acec12e3263bcb9a8cd4f0a4db5d98b96333))
- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.
