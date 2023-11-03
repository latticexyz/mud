# Change Log

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [52182f70]
  - @latticexyz/utils@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- @latticexyz/schema-type@2.0.0-next.12
- @latticexyz/utils@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- Updated dependencies [f99e8898]
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/utils@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.10
  - @latticexyz/utils@2.0.0-next.10

## 2.0.0-next.9

### Patch Changes

- Updated dependencies [[`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a)]:
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/utils@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.8
  - @latticexyz/utils@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.7
  - @latticexyz/utils@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/utils@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.5
  - @latticexyz/utils@2.0.0-next.5

## 2.0.0-next.4

### Minor Changes

- [#1351](https://github.com/latticexyz/mud/pull/1351) [`c14f8bf1`](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c) Thanks [@holic](https://github.com/holic)! - - Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

  - Fixed a bug in `waitForComponentValueIn` that caused the promise to not resolve if the component value was already set when the function was called.

  - Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, you must now pass in the full component object to the action's `updates` instead of just the component name.

    ```diff
      actions.add({
        updates: () => [
          {
    -       component: "Resource",
    +       component: Resource,
            ...
          }
        ],
        ...
      });
    ```

### Patch Changes

- [#1340](https://github.com/latticexyz/mud/pull/1340) [`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64) Thanks [@holic](https://github.com/holic)! - Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.4
  - @latticexyz/utils@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies []:
  - @latticexyz/schema-type@2.0.0-next.3
  - @latticexyz/utils@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- Updated dependencies [[`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

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

- [#1195](https://github.com/latticexyz/mud/pull/1195) [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd) Thanks [@holic](https://github.com/holic)! - Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

  This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

  - `component.id` is now the on-chain `bytes32` hex representation of the table ID
  - `component.metadata.componentName` is the table name (e.g. `Position`)
  - `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
  - `component.metadata.keySchema` is an object with key names and their corresponding ABI types
  - `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

- Updated dependencies [[`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07)]:
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- [#1167](https://github.com/latticexyz/mud/pull/1167) [`1e2ad78e`](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c) Thanks [@holic](https://github.com/holic)! - improve RECS error messages for v2 components

- Updated dependencies [[`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)]:
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **recs,cli:** fix bigint in recs and tsgen ([#563](https://github.com/latticexyz/mud/issues/563)) ([29fefae](https://github.com/latticexyz/mud/commit/29fefae43d96b107a66b9fd365b566cb8c466f8b))
- **recs:** overridden component update stream should return the overridden component ([#544](https://github.com/latticexyz/mud/issues/544)) ([9af097d](https://github.com/latticexyz/mud/commit/9af097de7914d0c43b7d65ca6271260439bc6bc4))

### Features

- **cli/recs/std-client:** add ts definitions generator ([#536](https://github.com/latticexyz/mud/issues/536)) ([dd1efa6](https://github.com/latticexyz/mud/commit/dd1efa6a1ebd2b3c62080d1b191633d7b0072916))
- **cli:** improve storeArgument, refactor cli ([#500](https://github.com/latticexyz/mud/issues/500)) ([bb68670](https://github.com/latticexyz/mud/commit/bb686702da75401d9ea4a8c8effcf3a15fa53b49))
- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **network,recs,std-client:** support StoreSetField before StoreSetRecord ([#581](https://github.com/latticexyz/mud/issues/581)) ([f259f90](https://github.com/latticexyz/mud/commit/f259f90e1c561163a6675f4ec51b1659681d880b)), closes [#479](https://github.com/latticexyz/mud/issues/479) [#523](https://github.com/latticexyz/mud/issues/523)
- **network:** integrate initial sync from MODE ([#493](https://github.com/latticexyz/mud/issues/493)) ([7d06c1b](https://github.com/latticexyz/mud/commit/7d06c1b5cf00df627000c907e78f60d3cd2415cd))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package @latticexyz/recs

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

**Note:** Version bump only for package @latticexyz/recs

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/recs

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/recs

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/recs

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/recs

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

**Note:** Version bump only for package @latticexyz/recs

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

**Note:** Version bump only for package @latticexyz/recs

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/recs

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

**Note:** Version bump only for package @latticexyz/recs

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

### Features

- **ecs-browser:** replace react syntax highlighter with shiki and bundler with tsup ([#262](https://github.com/latticexyz/mud/issues/262)) ([915506d](https://github.com/latticexyz/mud/commit/915506d7e7ca0b5a68afb646388bb9d4bb689879))

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

**Note:** Version bump only for package @latticexyz/recs

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

**Note:** Version bump only for package @latticexyz/recs

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

### Bug Fixes

- new entities should be included in overrides ([#290](https://github.com/latticexyz/mud/issues/290)) ([878ee2a](https://github.com/latticexyz/mud/commit/878ee2a5718d73221686dfe7de1c31a0f16347d7))

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

**Note:** Version bump only for package @latticexyz/recs

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package @latticexyz/recs

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

**Note:** Version bump only for package @latticexyz/recs

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

**Note:** Version bump only for package @latticexyz/recs

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

**Note:** Version bump only for package @latticexyz/recs

# [1.26.0](https://github.com/latticexyz/mud/compare/v1.25.1...v1.26.0) (2022-11-07)

**Note:** Version bump only for package @latticexyz/recs

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package @latticexyz/recs

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

**Note:** Version bump only for package @latticexyz/recs

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

**Note:** Version bump only for package @latticexyz/recs

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

**Note:** Version bump only for package @latticexyz/recs

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

**Note:** Version bump only for package @latticexyz/recs

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/recs

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/recs

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/recs

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

### Features

- **recs:** add util to clear cache of local cache component ([#217](https://github.com/latticexyz/mud/issues/217)) ([30a5868](https://github.com/latticexyz/mud/commit/30a5868f86a0d9e7a8de92f79c286841125f8ca7))

# [1.19.0](https://github.com/latticexyz/mud/compare/v1.18.0...v1.19.0) (2022-10-21)

**Note:** Version bump only for package @latticexyz/recs

# [1.18.0](https://github.com/latticexyz/mud/compare/v1.17.0...v1.18.0) (2022-10-21)

**Note:** Version bump only for package @latticexyz/recs

# [1.17.0](https://github.com/latticexyz/mud/compare/v1.16.0...v1.17.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/recs

# [1.16.0](https://github.com/latticexyz/mud/compare/v1.15.0...v1.16.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/recs

# [1.15.0](https://github.com/latticexyz/mud/compare/v1.14.2...v1.15.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/recs

## [1.14.2](https://github.com/latticexyz/mud/compare/v1.14.1...v1.14.2) (2022-10-18)

**Note:** Version bump only for package @latticexyz/recs

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package @latticexyz/recs

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

### Features

- expose registerComponent method from setupMUDNetwork ([#207](https://github.com/latticexyz/mud/issues/207)) ([4b078bd](https://github.com/latticexyz/mud/commit/4b078bd93c14dfbb1b06c5ca8bc92dee2e8dcfea))

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

**Note:** Version bump only for package @latticexyz/recs

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

**Note:** Version bump only for package @latticexyz/recs

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/recs

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/recs

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

### Bug Fixes

- **solecs): only allow components to register their own updates, feat(std-client:** add support for multiple overrides per component per action ([#199](https://github.com/latticexyz/mud/issues/199)) ([d8dd63e](https://github.com/latticexyz/mud/commit/d8dd63e8055c603d5df41ad47765a286d800c529))

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

**Note:** Version bump only for package @latticexyz/recs

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package @latticexyz/recs

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

**Note:** Version bump only for package @latticexyz/recs

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

### Bug Fixes

- make OverridableComponent conform with Component type ([#180](https://github.com/latticexyz/mud/issues/180)) ([c9d2c31](https://github.com/latticexyz/mud/commit/c9d2c311aa1c86d9bcabdf67eee598c264618ad0))

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/recs

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

**Note:** Version bump only for package @latticexyz/recs

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/recs

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

**Note:** Version bump only for package @latticexyz/recs

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

### Bug Fixes

- **recs:** change internal query behavior to match previous version ([47b8834](https://github.com/latticexyz/mud/commit/47b8834ce8d88f4b79febbfe94dbfb79def6d2b8))

### Features

- **recs:** add local cache component ([#169](https://github.com/latticexyz/mud/issues/169)) ([09058f6](https://github.com/latticexyz/mud/commit/09058f69a7d6d743afefc80da2c06020ff3d1a56))
- **recs:** allow multiple subscribers per query update$ ([6d13531](https://github.com/latticexyz/mud/commit/6d135314225f211814272e325fa8ab89952241ab))

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

**Note:** Version bump only for package @latticexyz/recs

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

**Note:** Version bump only for package @latticexyz/recs

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package @latticexyz/recs

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

**Note:** Version bump only for package @latticexyz/recs

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

**Note:** Version bump only for package @latticexyz/recs

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package @latticexyz/recs

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package @latticexyz/recs

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

### Features

- **recs:** add support for custom type in component ([#158](https://github.com/latticexyz/mud/issues/158)) ([fdc781d](https://github.com/latticexyz/mud/commit/fdc781d851147f2a98cbe95e89789a3c0ee226ca))

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package @latticexyz/recs

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

**Note:** Version bump only for package @latticexyz/recs

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package @latticexyz/recs

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

**Note:** Version bump only for package @latticexyz/recs

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

**Note:** Version bump only for package @latticexyz/recs

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

**Note:** Version bump only for package @latticexyz/recs

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

**Note:** Version bump only for package @latticexyz/recs

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

**Note:** Version bump only for package @latticexyz/recs

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

**Note:** Version bump only for package @latticexyz/recs

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

**Note:** Version bump only for package @latticexyz/recs

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

**Note:** Version bump only for package @latticexyz/recs

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

### Bug Fixes

- fix mud.dev build and improve responsiveness ([#134](https://github.com/latticexyz/mud/issues/134)) ([a3f2b24](https://github.com/latticexyz/mud/commit/a3f2b2438203697f1dd9f8710b15caa5cd83e40d))

### Features

- add mud.dev ([#133](https://github.com/latticexyz/mud/issues/133)) ([302588c](https://github.com/latticexyz/mud/commit/302588cbbab2803396b894bc006d13e6ac943da9))

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

**Note:** Version bump only for package @latticexyz/recs

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

**Note:** Version bump only for package @latticexyz/recs

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

**Note:** Version bump only for package @latticexyz/recs

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- better getComponentValueStrict error message, small std-client fixes ([#121](https://github.com/latticexyz/mud/issues/121)) ([5c78b82](https://github.com/latticexyz/mud/commit/5c78b82a88a9d50091bf3c4e65100eb3cb6230b2))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package @latticexyz/recs

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package @latticexyz/recs

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package @latticexyz/recs

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Bug Fixes

- **recs:** fix fragment types in system definitions ([#109](https://github.com/latticexyz/mud/issues/109)) ([c74f393](https://github.com/latticexyz/mud/commit/c74f393255af46336e9823b08a2aa7f366cad866))

### Features

- allow component overrides to be null ([f9baf44](https://github.com/latticexyz/mud/commit/f9baf446e3ddb346792b169bb0942b41c60ac9fb))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package @latticexyz/recs

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package @latticexyz/recs

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Features

- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)
- new systems pattern ([#63](https://github.com/latticexyz/mud/issues/63)) ([fb6197b](https://github.com/latticexyz/mud/commit/fb6197b997eb7232e38ecfb9116ff256491dc38c))

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- add webworker architecture for contract/client sync, add cache webworker ([#10](https://github.com/latticexyz/mud/issues/10)) ([4ef9f90](https://github.com/latticexyz/mud/commit/4ef9f909d1d3c10f6bea888b2c32b1d1df04185a)), closes [#14](https://github.com/latticexyz/mud/issues/14)
- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
- **recs:** add more granular type assertion function for introspecting Component schema types ([#8](https://github.com/latticexyz/mud/issues/8)) ([48331f9](https://github.com/latticexyz/mud/commit/48331f911eb9f6e39eb774a1aecf759f69729aa4))
- **recs:** add optional parameters to reaction and autorun systems ([451209f](https://github.com/latticexyz/mud/commit/451209f98c17e4b228d7a828662e4b72077fe55f))
- **recs:** expose raw schema on component ([69d9b89](https://github.com/latticexyz/mud/commit/69d9b8978b95a50091a896c123e1c47110e81803))
- **recs:** rewrite for performance improvements (without integrating in ri) ([#22](https://github.com/latticexyz/mud/issues/22)) ([887564d](https://github.com/latticexyz/mud/commit/887564dbe0fad4250b82fd29d144305f176e3b89))

### BREAKING CHANGES

- Components have to implement a getSchema() function

- feat(network): make Sync worker return a stream of ECS events (prev contract events)

- feat(ri-contracts): integrate solecs change (add getSchema to components)

- feat(ri-client): integrate network package changes

- feat(network): store ECS state in cache

- feat(network): load state from cache

- feat(utils): add more utils for iterables

- refactor(network): clean up

- feat(network): generalize component value decoder function, add tests

- fix(network): make it possible to subscribe to ecsStream from sync worker multiple times

- fix(network): start sync from provided initial block number

- feat(network): move storing ecs to indexDB to its own Cache worker

- feat(network): create separate cache for every World contract address

- fix(network): fix issues discovered during live review

- chore: remove unused import

- Update packages/network/src/createBlockNumberStream.ts

Co-authored-by: ludens <ludens@lattice.xyz>

- feat(network): add clock syncInterval as config parameter

- feat(utils): emit values through componentToStream and observableToStream only if non-null

- feat(network): add chain id to cache id, disable loading from cache on hardhat

- fix(contracts): change Position and EntityType schema to int32/uint32 to fit in js number

- docs(client): fix typos in comments

- fix(network): fix tests

- fix(scripting): integrate new network package into ri scripting

- fix(network): fix sending multiple requests for component schema if many events get reduced

## [0.1.8](https://github.com/latticexyz/mud/compare/v0.1.7...v0.1.8) (2022-05-25)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.7](https://github.com/latticexyz/mud/compare/v0.1.6...v0.1.7) (2022-05-25)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.6](https://github.com/latticexyz/mud/compare/v0.1.5...v0.1.6) (2022-05-25)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.5](https://github.com/latticexyz/mud/compare/v0.1.4...v0.1.5) (2022-05-24)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.4](https://github.com/latticexyz/mud/compare/v0.1.3...v0.1.4) (2022-05-24)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.3](https://github.com/latticexyz/mud/compare/v0.1.2...v0.1.3) (2022-05-23)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.2](https://github.com/latticexyz/mud/compare/v0.1.1...v0.1.2) (2022-05-23)

**Note:** Version bump only for package @latticexyz/recs

## [0.1.1](https://github.com/latticexyz/mud/compare/v0.1.0...v0.1.1) (2022-05-23)

**Note:** Version bump only for package @latticexyz/recs

# 0.1.0 (2022-05-23)

### Features

- **@mud/recs:** add @mud/recs ([aaf6d0f](https://github.com/latticexyz/mud/commit/aaf6d0faf7a98330823ed3449936c5c336113d7e))
