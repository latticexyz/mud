# Change Log

## 2.0.0-next.13

### Major Changes

- 78949f2c: Replaced the `react` template with a basic task list app using the new Zustand storage adapter and sync method. This new template better demonstrates the different ways of building with MUD and has fewer concepts to learn (i.e. just tables and records, no more ECS).

  For ECS-based React apps, you can use `react-ecs` template for the previous RECS storage adapter.

### Minor Changes

- 6288f903: Updated templates to use [mprocs](https://github.com/pvolok/mprocs) instead of [concurrently](https://github.com/open-cli-tools/concurrently) for running dev scripts.
- b68e1699: Enabled MUD CLI debug logs for all templates.

### Patch Changes

- c5148da7: Updated templates' PostDeploy script to set store address so that tables can be used directly inside PostDeploy.
- 1b33a915: Fixed an issue when creating a new project from the `react` app, where React's expressions were overlapping with Handlebars expressions (used by our template command).

## 2.0.0-next.12

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

- d844cd44: Sped up builds by using more of forge's cache.

  Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8

## 2.0.0-next.10

## 2.0.0-next.9

### Minor Changes

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

- [#1483](https://github.com/latticexyz/mud/pull/1483) [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab) Thanks [@holic](https://github.com/holic)! - Templates now use `out` for their `forge build` artifacts, including ABIs. If you have a project created from a previous template, you can update your `packages/contracts/package.json` with:

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

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

- [#1354](https://github.com/latticexyz/mud/pull/1354) [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853) Thanks [@dk1a](https://github.com/dk1a)! - We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  As such, we've replaced `blockStorageOperations# Change Log with `storedBlockLogs# Change Log, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

- [#1558](https://github.com/latticexyz/mud/pull/1558) [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f) Thanks [@alvrs](https://github.com/alvrs)! - What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

### Patch Changes

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

## 2.0.0-next.8

## 2.0.0-next.7

## 2.0.0-next.6

### Minor Changes

- [#1403](https://github.com/latticexyz/mud/pull/1403) [`55377ffe`](https://github.com/latticexyz/mud/commit/55377ffe6bfab13e0e834fadc07df4ef75122295) Thanks [@holic](https://github.com/holic)! - We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

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

## 2.0.0-next.5

## 2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

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

- [#1311](https://github.com/latticexyz/mud/pull/1311) [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1) Thanks [@alvrs](https://github.com/alvrs)! - Move `createFaucetService` from `@latticexyz/network` to `@latticexyz/services/faucet`.

  ```diff
  - import { createFaucetService } from "@latticexyz/network";
  + import { createFaucetService } from "@latticexyz/services/faucet";
  ```

- [#1311](https://github.com/latticexyz/mud/pull/1311) [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1) Thanks [@alvrs](https://github.com/alvrs)! - Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

  - `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

    ```
    - import { getBurnerWallet } from "@latticexyz/std-client";
    + import { getBurnerPrivateKey } from "@latticexyz/common";

    - const privateKey = getBurnerWallet().value;
    - const privateKey = getBurnerPrivateKey();
    ```

  - All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.

  - The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.

  - Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

    ```diff
    - import { ... } from "@latticexyz/std-client";
    + import { ... } from "@latticexyz/std-client/deprecated";
    ```

## 2.0.0-next.2

### Major Changes

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

- [#1284](https://github.com/latticexyz/mud/pull/1284) [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad) Thanks [@holic](https://github.com/holic)! - MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

  ```diff
  import { mount as mountDevTools } from "@latticexyz/dev-tools";

  - mountDevTools();
  + mountDevTools({
  +   config,
  +   publicClient,
  +   walletClient,
  +   latestBlock$,
  +   blockStorageOperations$,
  +   worldAddress,
  +   worldAbi,
  +   write$,
  +   // if you're using recs
  +   recsWorld,
  + });
  ```

  It's also advised to wrap dev tools so that it is only mounted during development mode. Here's how you do this with Vite:

  ```ts
  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    mountDevTools({ ... });
  }
  ```

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

## 2.0.0-next.1

### Major Changes

- [#1214](https://github.com/latticexyz/mud/pull/1214) [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9) Thanks [@holic](https://github.com/holic)! - Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

  These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

  If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

  **Migrate existing RECS apps to new sync packages**

  As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

  1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)

  2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

     ```diff
     - import { foundry } from "viem/chains";
     - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
     + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

     - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
     + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
     ```

  3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

     ```diff
     - export async function getNetworkConfig(): Promise<NetworkConfig> {
     + export async function getNetworkConfig() {
     ```

     ```diff
       const initialBlockNumber = params.has("initialBlockNumber")
         ? Number(params.get("initialBlockNumber"))
     -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
     +   : world?.blockNumber ?? 0n;
     ```

     ```diff
     + return {
     +   privateKey: getBurnerWallet().value,
     +   chain,
     +   worldAddress,
     +   initialBlockNumber,
     +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
     + };
     ```

  4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

     ```diff
     - import { setupMUDV2Network } from "@latticexyz/std-client";
     - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
     + import { createFaucetService } from "@latticexyz/network";
     + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
     + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
     + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
     ```

     ```diff
     - const result = await setupMUDV2Network({
     -   ...
     - });

     + const clientOptions = {
     +   chain: networkConfig.chain,
     +   transport: transportObserver(fallback([webSocket(), http()])),
     +   pollingInterval: 1000,
     + } as const satisfies ClientConfig;

     + const publicClient = createPublicClient(clientOptions);

     + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
     + const burnerWalletClient = createWalletClient({
     +   ...clientOptions,
     +   account: burnerAccount,
     + });

     + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
     +   world,
     +   config: storeConfig,
     +   address: networkConfig.worldAddress as Hex,
     +   publicClient,
     +   components: contractComponents,
     +   startBlock: BigInt(networkConfig.initialBlockNumber),
     +   indexerUrl: networkConfig.indexerUrl ?? undefined,
     + });

     + const worldContract = createContract({
     +   address: networkConfig.worldAddress as Hex,
     +   abi: IWorld__factory.abi,
     +   publicClient,
     +   walletClient: burnerWalletClient,
     + });
     ```

     ```diff
       // Request drip from faucet
     - const signer = result.network.signer.get();
     - if (networkConfig.faucetServiceUrl && signer) {
     -   const address = await signer.getAddress();
     + if (networkConfig.faucetServiceUrl) {
     +   const address = burnerAccount.address;
     ```

     ```diff
       const requestDrip = async () => {
     -   const balance = await signer.getBalance();
     +   const balance = await publicClient.getBalance({ address });
         console.info(`[Dev Faucet]: Player balance -> ${balance}`);
     -   const lowBalance = balance?.lte(utils.parseEther("1"));
     +   const lowBalance = balance < parseEther("1");
     ```

     You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

     The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

     ```diff
     + return {
     +   world,
     +   components,
     +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
     +   publicClient,
     +   walletClient: burnerWalletClient,
     +   latestBlock$,
     +   blockStorageOperations$,
     +   waitForTransaction,
     +   worldContract,
     + };
     ```

  5. Update `createSystemCalls` with the new return type of `setupNetwork`.

     ```diff
       export function createSystemCalls(
     -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
     +   { worldContract, waitForTransaction }: SetupNetworkResult,
         { Counter }: ClientComponents
       ) {
          const increment = async () => {
     -      const tx = await worldSend("increment", []);
     -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
     +      const tx = await worldContract.write.increment();
     +      await waitForTransaction(tx);
            return getComponentValue(Counter, singletonEntity);
          };
     ```

  6. (optional) If you still need a clock, you can create it with:

     ```ts
     import { map, filter } from "rxjs";
     import { createClock } from "@latticexyz/network";

     const clock = createClock({
       period: 1000,
       initialTime: 0,
       syncInterval: 5000,
     });

     world.registerDisposer(() => clock.dispose());

     latestBlock$
       .pipe(
         map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
         filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime) // Ignore if the current local timestamp is correct
       )
       .subscribe(clock.update); // Update the local clock
     ```

  If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

  ```ts
  import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

  const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
    message: "Connecting",
    percentage: 0,
    step: SyncStep.INITIALIZE,
  });

  if (syncProgress.step === SyncStep.LIVE) {
    // we're live!
  }
  ```

## 2.0.0-next.0

### Patch Changes

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

- [#1165](https://github.com/latticexyz/mud/pull/1165) [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b) Thanks [@holic](https://github.com/holic)! - bump to latest TS version (5.1.6)

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- align git dep versions ([#577](https://github.com/latticexyz/mud/issues/577)) ([2b5fb5e](https://github.com/latticexyz/mud/commit/2b5fb5e94ad3e7e1134608121fec6c7b6a64d539))
- **create-mud:** use pnpm in templates, move to root so they can be installed/run ([#599](https://github.com/latticexyz/mud/issues/599)) ([010740d](https://github.com/latticexyz/mud/commit/010740d09d40d4ff6d95538d498a513fbb65ca45))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package create-mud

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

### Features

- **create-mud:** default to latest mud version ([#432](https://github.com/latticexyz/mud/issues/432)) ([5a38ad6](https://github.com/latticexyz/mud/commit/5a38ad6b96058883518427fe87ad8f85fb266366))

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

### Bug Fixes

- **create-mud:** small linting/type fixes for templates ([#425](https://github.com/latticexyz/mud/issues/425)) ([1f2598c](https://github.com/latticexyz/mud/commit/1f2598cff40cd9f5059b553b9291ffd2c61bacdd))

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package create-mud

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Features

- **create-mud:** update mud versions ([#407](https://github.com/latticexyz/mud/issues/407)) ([96dfef9](https://github.com/latticexyz/mud/commit/96dfef992f25714963792137043639c0b67c903f))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package create-mud

# [1.36.0](https://github.com/latticexyz/mud/compare/v1.35.0...v1.36.0) (2023-02-16)

### Bug Fixes

- **create-mud:** attempt to fix create-mud build/install issues ([#406](https://github.com/latticexyz/mud/issues/406)) ([ea53acc](https://github.com/latticexyz/mud/commit/ea53accaa684c42982bb1cac4ac1fcefd07d1603))

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

### Features

- **create-mud:** add create-mud package ([#336](https://github.com/latticexyz/mud/issues/336)) ([e85c124](https://github.com/latticexyz/mud/commit/e85c1244bf63ccd0a287849dd33fa685d95ea081))
