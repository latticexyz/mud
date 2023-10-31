# Change Log

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
  if (true) {
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
