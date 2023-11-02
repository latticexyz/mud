# Change Log

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/config@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Major Changes

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

### Patch Changes

- f62c767e: Parallelized table codegen. Also put logs behind debug flag, which can be enabled using the `DEBUG=mud:*` environment variable.
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/config@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/config@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/config@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1482](https://github.com/latticexyz/mud/pull/1482) [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
  The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

  ```diff
  // mud.config.ts
  export default mudConfig({
    tables: {
      CounterTable: {
        keySchema: {},
  -     schema: {
  +     valueSchema: {
          value: "uint32",
        },
      },
    }
  }
  ```

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  If you've written your own sync logic or are interacting with Store calls directly, this is a breaking change. We have a few more breaking protocol changes upcoming, so you may hold off on upgrading until those land.

  If you are using MUD's built-in tooling (table codegen, indexer, store sync, etc.), you don't have to make any changes except upgrading to the latest versions and deploying a fresh World.

  - The `data` field in each `StoreSetRecord` and `StoreEphemeralRecord` has been replaced with three new fields: `staticData`, `encodedLengths`, and `dynamicData`. This better reflects the on-chain state and makes it easier to perform modifications to the raw bytes. We recommend storing each of these fields individually in your off-chain storage of choice (indexer, client, etc.).

    ```diff
    - event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);

    - event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
    + event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);
    ```

  - The `StoreSetField` event is now replaced by two new events: `StoreSpliceStaticData` and `StoreSpliceDynamicData`. Splicing allows us to perform efficient operations like push and pop, in addition to replacing a field value. We use two events because updating a dynamic-length field also requires updating the record's `encodedLengths` (aka PackedCounter).

    ```diff
    - event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
    + event StoreSpliceStaticData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data);
    + event StoreSpliceDynamicData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths);
    ```

  Similarly, Store setter methods (e.g. `setRecord`) have been updated to reflect the `data` to `staticData`, `encodedLengths`, and `dynamicData` changes. We'll be following up shortly with Store getter method changes for more gas efficient storage reads.

- [#1589](https://github.com/latticexyz/mud/pull/1589) [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2) Thanks [@alvrs](https://github.com/alvrs)! - The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
  where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

  ```diff
  IStore {
    event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes data,
  -   PackedCounter encodedLengths
    );
  }

  IStoreHook {
    function onBeforeSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;

    function onAfterSpliceDynamicData(
      ResourceId tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
  +   PackedCounter encodedLengths,
      bytes memory data,
  -   PackedCounter encodedLengths
    ) external;
  }
  ```

- [#1527](https://github.com/latticexyz/mud/pull/1527) [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8) Thanks [@holic](https://github.com/holic)! - Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

  ```diff
  - import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
  + import {
  +   BEFORE_SET_RECORD,
  +   BEFORE_SET_FIELD,
  +   BEFORE_DELETE_RECORD
  + } from "@latticexyz/store/storeHookTypes.sol";

    StoreCore.registerStoreHook(
      tableId,
      subscriber,
  -   StoreHookLib.encodeBitmap({
  -     onBeforeSetRecord: true,
  -     onAfterSetRecord: false,
  -     onBeforeSetField: true,
  -     onAfterSetField: false,
  -     onBeforeDeleteRecord: true,
  -     onAfterDeleteRecord: false
  -   })
  +   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
    );
  ```

  ```diff
  - import { SystemHookLib } from "../src/SystemHook.sol";
  + import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

    world.registerSystemHook(
      systemId,
      subscriber,
  -   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
  +   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
    );

  ```

- [#1531](https://github.com/latticexyz/mud/pull/1531) [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4) Thanks [@alvrs](https://github.com/alvrs)! - - The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

  - All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.

  - `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

    These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
    the new splice hooks.

    `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

    ```solidity
    interface IStore {
      // Splice data in the static part of the record
      function spliceStaticData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
        uint40 deleteCount,
        bytes calldata data
      ) external;

      // Splice data in the dynamic part of the record
      function spliceDynamicData(
        bytes32 tableId,
        bytes32[] calldata keyTuple,
        uint8 dynamicFieldIndex,
        uint40 startWithinField,
        uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

- [#1336](https://github.com/latticexyz/mud/pull/1336) [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e) Thanks [@dk1a](https://github.com/dk1a)! - - Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

  - Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

    `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

  - Add `getFieldLayout` to `IStore` interface.

    There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

  - Add `fieldLayoutToHex` utility to `protocol-parser` package.

  - Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.

- [#1532](https://github.com/latticexyz/mud/pull/1532) [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623) Thanks [@dk1a](https://github.com/dk1a)! - Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

  If you use codegenerated libraries, you will only need to update `encode` calls.

  ```diff
  - bytes memory data = Position.encode(x, y);
  + (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
  ```

- [#1483](https://github.com/latticexyz/mud/pull/1483) [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab) Thanks [@holic](https://github.com/holic)! - Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

  ```diff
  - import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
  + import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
  ```

  `MudTest.sol` was also moved to the World package. You can update your import like:

  ```diff
  - import { MudTest } from "@latticexyz/store/src/MudTest.sol";
  + import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
  ```

- [#1566](https://github.com/latticexyz/mud/pull/1566) [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9) Thanks [@dk1a](https://github.com/dk1a)! - These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

  - Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
  - In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
  - Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
  - Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.

- [#1550](https://github.com/latticexyz/mud/pull/1550) [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e) Thanks [@dk1a](https://github.com/dk1a)! - - Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).

  - Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.

- [#1602](https://github.com/latticexyz/mud/pull/1602) [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840) Thanks [@holic](https://github.com/holic)! - - Moves Store events into its own `IStoreEvents` interface

  - Moves Store interfaces to their own files
  - Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

  If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

- [#1318](https://github.com/latticexyz/mud/pull/1318) [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130) Thanks [@holic](https://github.com/holic)! - Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

  Both can be overridden via the MUD config:

  ```ts
  export default mudConfig({
    /** Filename where common user types will be generated and imported from. */
    userTypesFilename: "common.sol",
    /** Filename where codegen index will be generated. */
    codegenIndexFilename: "index.sol",
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

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- [#1601](https://github.com/latticexyz/mud/pull/1601) [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70) Thanks [@alvrs](https://github.com/alvrs)! - Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

- [#1577](https://github.com/latticexyz/mud/pull/1577) [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c) Thanks [@alvrs](https://github.com/alvrs)! - `Store` events have been renamed for consistency and readability.
  If you're parsing `Store` events manually, you need to update your ABI.
  If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

  ```diff
  - event StoreSetRecord(
  + event Store_SetRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      bytes staticData,
      bytes32 encodedLengths,
      bytes dynamicData
    );
  - event StoreSpliceStaticData(
  + event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data
    );
  - event StoreSpliceDynamicData(
  + event Store_SpliceDynamicData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes data,
      bytes32 encodedLengths
    );
  - event StoreDeleteRecord(
  + event Store_DeleteRecord(
      ResourceId indexed tableId,
      bytes32[] keyTuple
    );
  ```

- [#1544](https://github.com/latticexyz/mud/pull/1544) [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae) Thanks [@alvrs](https://github.com/alvrs)! - - `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

  - All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
    All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IStore {
      function setRecord(
    -   bytes32 tableId,
    +   ResourceId tableId,
        bytes32[] calldata keyTuple,
        bytes calldata staticData,
        PackedCounter encodedLengths,
        bytes calldata dynamicData,
        FieldLayout fieldLayout
      ) external;

      // Same for all other methods
    }
    ```

    ```diff
    import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

    IBaseWorld {
      function callFrom(
        address delegator,
    -   bytes32 resourceSelector,
    +   ResourceId systemId,
        bytes memory callData
      ) external payable returns (bytes memory);

      // Same for all other methods
    }
    ```

- [#1520](https://github.com/latticexyz/mud/pull/1520) [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380) Thanks [@holic](https://github.com/holic)! - Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.

- [#1472](https://github.com/latticexyz/mud/pull/1472) [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf) Thanks [@alvrs](https://github.com/alvrs)! - - `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

  - The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
    `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.

- [#1587](https://github.com/latticexyz/mud/pull/1587) [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d) Thanks [@alvrs](https://github.com/alvrs)! - Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

- [#1581](https://github.com/latticexyz/mud/pull/1581) [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b) Thanks [@alvrs](https://github.com/alvrs)! - - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

  - The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
    This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

    ```diff

    event Store_SpliceStaticData(
      ResourceId indexed tableId,
      bytes32[] keyTuple,
      uint48 start,
    - uint40 deleteCount,
      bytes data
    );

    interface IStore {
      function spliceStaticData(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
        uint48 start,
    -   uint40 deleteCount,
        bytes calldata data
      ) external;
    }
    ```

  - The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
    If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

    ```diff
    - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
    + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
    ```

  - All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
    have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

    Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
    The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

    ```diff
    interface IStore {
    - function pushToField(
    + function pushToDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        bytes calldata dataToPush,
    -   FieldLayout fieldLayout
      ) external;

    - function popFromField(
    + function popFromDynamicField(
        ResourceId tableId,
        bytes32[] calldata keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
        uint256 byteLengthToPop,
    -   FieldLayout fieldLayout
      ) external;

    - function getFieldSlice(
    + function getDynamicFieldSlice(
        ResourceId tableId,
        bytes32[] memory keyTuple,
    -   uint8 fieldIndex,
    +   uint8 dynamicFieldIndex,
    -   FieldLayout fieldLayout,
        uint256 start,
        uint256 end
      ) external view returns (bytes memory data);
    }
    ```

  - `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

    ```diff
    IStore {
    + function getDynamicFieldLength(
    +   ResourceId tableId,
    +   bytes32[] memory keyTuple,
    +   uint8 dynamicFieldIndex
    + ) external view returns (uint256);
    }

    ```

  - `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.

  - `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.

  - The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
    This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

### Minor Changes

- [#1511](https://github.com/latticexyz/mud/pull/1511) [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7) Thanks [@holic](https://github.com/holic)! - Add protocol version with corresponding getter and event on deploy

  ```solidity
  world.worldVersion();
  world.storeVersion(); // a World is also a Store
  ```

  ```solidity
  event HelloWorld(bytes32 indexed worldVersion);
  event HelloStore(bytes32 indexed storeVersion);
  ```

- [#1521](https://github.com/latticexyz/mud/pull/1521) [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314) Thanks [@alvrs](https://github.com/alvrs)! - `StoreCore` and `IStore` now expose specific functions for `getStaticField` and `getDynamicField` in addition to the general `getField`.
  Using the specific functions reduces gas overhead because more optimized logic can be executed.

  ```solidity
  interface IStore {
    /**
     * Get a single static field from the given tableId and key tuple, with the given value field layout.
     * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
     * Consumers are expected to truncate the returned value as needed.
     */
    function getStaticField(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 fieldIndex,
      FieldLayout fieldLayout
    ) external view returns (bytes32);

    /**
     * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
     * (Dynamic field index = field index - number of static fields)
     */
    function getDynamicField(
      bytes32 tableId,
      bytes32[] memory keyTuple,
      uint8 dynamicFieldIndex
    ) external view returns (bytes memory);
  }
  ```

- [#1542](https://github.com/latticexyz/mud/pull/1542) [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2) Thanks [@dk1a](https://github.com/dk1a)! - Add an optional `namePrefix` argument to `renderRecordData`, to support inlined logic in codegenned `set` method which uses a struct.

- [#1513](https://github.com/latticexyz/mud/pull/1513) [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280) Thanks [@Boffee](https://github.com/Boffee)! - Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
  This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

  We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

  ```solidity
  library Counter {
    // Dynamically determine which store to write to based on the context
    function set(uint32 value) internal;

    // Always write to own storage
    function _set(uint32 value) internal;

    // ... equivalent functions for all other Store methods
  }
  ```

### Patch Changes

- [#1490](https://github.com/latticexyz/mud/pull/1490) [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84) Thanks [@alvrs](https://github.com/alvrs)! - Include bytecode for `World` and `Store` in npm packages.

- [#1600](https://github.com/latticexyz/mud/pull/1600) [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8) Thanks [@alvrs](https://github.com/alvrs)! - Moved the test tables out of the main config in `world` and `store` and into their own separate config.

- [#1508](https://github.com/latticexyz/mud/pull/1508) [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9) Thanks [@Boffee](https://github.com/Boffee)! - The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
  This significantly reduces gas cost in all table library functions.

- [#1512](https://github.com/latticexyz/mud/pull/1512) [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c) Thanks [@Boffee](https://github.com/Boffee)! - Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).

- [#1568](https://github.com/latticexyz/mud/pull/1568) [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c) Thanks [@alvrs](https://github.com/alvrs)! - Prefixed all errors with their respective library/contract for improved debugging.

- [#1544](https://github.com/latticexyz/mud/pull/1544) [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae) Thanks [@alvrs](https://github.com/alvrs)! - The `ResourceType` table is removed.
  It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

  To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
  The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
  This problem is solved by the new table `ResourceIds` being part of `Store`.

  `StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

  ```diff
  - import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
  - import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
  + import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

  - bool tableExists = StoreCore.hasTable(tableId);
  + bool tableExists = ResourceIds.getExists(tableId);

  - bool systemExists = ResourceType.get(systemId) != Resource.NONE;
  + bool systemExists = ResourceIds.getExists(systemId);
  ```

- [#1484](https://github.com/latticexyz/mud/pull/1484) [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );

  event StoreSetField(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key
  );

  event StoreEphemeralRecord(
  - bytes32 table,
  + bytes32 tableId,
    bytes32[] key,
    bytes data
  );
  ```

- [#1492](https://github.com/latticexyz/mud/pull/1492) [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96) Thanks [@alvrs](https://github.com/alvrs)! - Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
  This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

  ```diff
  event StoreSetRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );

  event StoreSetField(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    uint8 fieldIndex,
    bytes data
  );

  event StoreDeleteRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
  );

  event StoreEphemeralRecord(
    bytes32 tableId,
  - bytes32[] key,
  + bytes32[] keyTuple,
    bytes data
  );
  ```

- [#1599](https://github.com/latticexyz/mud/pull/1599) [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619) Thanks [@alvrs](https://github.com/alvrs)! - Minor `Store` cleanups: renamed `Utils.sol` to `leftMask.sol` since it only contains a single free function, and removed a leftover sanity check.

- [#1586](https://github.com/latticexyz/mud/pull/1586) [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612) Thanks [@alvrs](https://github.com/alvrs)! - All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.

- [#1509](https://github.com/latticexyz/mud/pull/1509) [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87) Thanks [@Boffee](https://github.com/Boffee)! - Optimized the `StoreCore` hash function determining the data location to use less gas.

- [#1569](https://github.com/latticexyz/mud/pull/1569) [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7) Thanks [@alvrs](https://github.com/alvrs)! - Simplified a couple internal constants used for bitshifting.

- Updated dependencies [[`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/config@2.0.0-next.9

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
