# Change Log

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
