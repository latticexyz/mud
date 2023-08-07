---
"@latticexyz/cli": patch
"@latticexyz/common": major
"@latticexyz/create-mud": major
"@latticexyz/recs": patch
"@latticexyz/store-indexer": patch
---

Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

## Migrate existing RECS apps to new sync packages

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

3. In `getNetworkConfig.ts`, we'll remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

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
   + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther } from "viem";
   + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
   ```

   ```diff
   - const result = await setupMUDV2Network({
   -   ...
   - });

   + const publicClient = createPublicClient({
   +   chain: networkConfig.chain,
   +   transport: mudTransportObserver(fallback([webSocket(), http()])),
   +   pollingInterval: 1000,
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

   + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
   + const burnerWalletClient = createWalletClient({
   +   account: burnerAccount,
   +   chain: networkConfig.chain,
   +   transport: mudTransportObserver(fallback([webSocket(), http()])),
   +   pollingInterval: 1000,
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
   +   worldContract: getContract({
   +     address: networkConfig.worldAddress as Hex,
   +     abi: IWorld__factory.abi,
   +     publicClient,
   +     walletClient: burnerWalletClient,
   +   }),
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

If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`.

```ts
import { SyncStep } from "@latticexyz/store-sync/recs";

const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
  message: "Connecting",
  percentage: 0,
  step: SyncStep.INITIALIZE,
});

if (syncProgress.step === SyncStep.LIVE) {
  // we're live!
}
```
