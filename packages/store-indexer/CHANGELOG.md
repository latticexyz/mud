# @latticexyz/store-indexer

## 2.0.0-next.8

### Patch Changes

- Updated dependencies [[`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7), [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)]:
  - @latticexyz/store@2.0.0-next.8
  - @latticexyz/store-sync@2.0.0-next.8
  - @latticexyz/block-logs-stream@2.0.0-next.8
  - @latticexyz/common@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies [[`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15)]:
  - @latticexyz/store@2.0.0-next.7
  - @latticexyz/store-sync@2.0.0-next.7
  - @latticexyz/block-logs-stream@2.0.0-next.7
  - @latticexyz/common@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies [[`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)]:
  - @latticexyz/store@2.0.0-next.6
  - @latticexyz/store-sync@2.0.0-next.6
  - @latticexyz/block-logs-stream@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/store-sync@2.0.0-next.5
  - @latticexyz/block-logs-stream@2.0.0-next.5
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/store@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @latticexyz/store-sync@2.0.0-next.4
  - @latticexyz/block-logs-stream@2.0.0-next.4
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/store@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`3e024fcf`](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/store-sync@2.0.0-next.3
  - @latticexyz/block-logs-stream@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1232](https://github.com/latticexyz/mud/pull/1232) [`b621fb97`](https://github.com/latticexyz/mud/commit/b621fb97731a0ceed9b67d741f40648a8aa64817) Thanks [@holic](https://github.com/holic)! - Adds a [Fastify](https://fastify.dev/) server in front of tRPC and puts tRPC endpoints under `/trpc` to make way for other top-level endpoints (e.g. [tRPC panel](https://github.com/iway1/trpc-panel) or other API frontends like REST or gRPC).

  If you're using `@latticexyz/store-sync` packages with an indexer (either `createIndexerClient` or `indexerUrl` argument of `syncToRecs`), then you'll want to update your indexer URL:

  ```diff
   createIndexerClient({
  -  url: "https://indexer.dev.linfra.xyz",
  +  url: "https://indexer.dev.linfra.xyz/trpc",
   });
  ```

  ```diff
   syncToRecs({
     ...
  -  indexerUrl: "https://indexer.dev.linfra.xyz",
  +  indexerUrl: "https://indexer.dev.linfra.xyz/trpc",
   });
  ```

### Minor Changes

- [#1240](https://github.com/latticexyz/mud/pull/1240) [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e) Thanks [@holic](https://github.com/holic)! - Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e), [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/store-sync@2.0.0-next.2
  - @latticexyz/block-logs-stream@2.0.0-next.2

## 2.0.0-next.1

### Major Changes

- [#1198](https://github.com/latticexyz/mud/pull/1198) [`e86fbc12`](https://github.com/latticexyz/mud/commit/e86fbc1260f698c6a7b6a92c901fefd186c329ff) Thanks [@holic](https://github.com/holic)! - Adds store indexer service package with utils to query the indexer service.

  You can run the indexer locally by checking out the MUD monorepo, installing/building everything, and running `pnpm start:local` from `packages/store-indexer`.

  To query the indexer in the client, you can create a tRPC client with a URL pointing to the indexer service and call the available tRPC methods:

  ```ts
  import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";

  const indexer = createIndexerClient({ url: indexerUrl });
  const result = await indexer.findAll.query({
    chainId: publicClient.chain.id,
    address,
  });
  ```

  If you're using `syncToRecs`, you can just pass in the `indexerUrl` option as a shortcut to the above:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";

  syncToRecs({
    ...
    indexerUrl: "https://your.indexer.service",
  });
  ```

### Minor Changes

- [#1234](https://github.com/latticexyz/mud/pull/1234) [`131c63e5`](https://github.com/latticexyz/mud/commit/131c63e539a8e9947835dcc323c8b37562aed9ca) Thanks [@holic](https://github.com/holic)! - - Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
  - Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.

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

- Updated dependencies [[`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`e86fbc12`](https://github.com/latticexyz/mud/commit/e86fbc1260f698c6a7b6a92c901fefd186c329ff), [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`57a52608`](https://github.com/latticexyz/mud/commit/57a5260830401c9ad93196a895a50b0fc4a86183), [`9e5baf4f`](https://github.com/latticexyz/mud/commit/9e5baf4fff0c60615b8f2b4645fb11cb78cb0bd8), [`131c63e5`](https://github.com/latticexyz/mud/commit/131c63e539a8e9947835dcc323c8b37562aed9ca), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`582388ba`](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b), [`582388ba`](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/store-sync@2.0.0-next.1
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/block-logs-stream@2.0.0-next.1
