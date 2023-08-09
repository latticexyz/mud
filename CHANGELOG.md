# Version 2.0.0-next.1

## Major changes

**[chore: fix changeset type (#1220)](https://github.com/latticexyz/mud/commit/2f6cfef91daacf09db82a4b7c69cff3af583b8f6)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Adds store indexer service package with utils to query the indexer service.

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

**[fix: changeset package name (#1270)](https://github.com/latticexyz/mud/commit/9a7c9009a43bc5691bb33996bcf669711cc51503)** (@latticexyz/cli, @latticexyz/common, @latticexyz/recs, @latticexyz/store-indexer, create-mud)

Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

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

**[feat(common): replace TableId with tableIdToHex/hexToTableId (#1258)](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7)** (@latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/std-client, @latticexyz/store-sync)

Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

**[feat(common): add createContract, createNonceManager utils (#1261)](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb)** (@latticexyz/common)

Add utils for using viem with MUD

- `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
- `createNonceManager` helps track local nonces, used by `createContract`.

Also renames `mudTransportObserver` to `transportObserver`.

## Minor changes

**[feat(common): add viem utils (#1245)](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50)** (@latticexyz/common)

Add utils for using viem with MUD

- `mudFoundry` chain with a transaction request formatter that temporarily removes max fees to work better with anvil `--base-fee 0`
- `createBurnerAccount` that also temporarily removes max fees during transaction signing to work better with anvil `--base-fee 0`
- `mudTransportObserver` that will soon let MUD Dev Tools observe transactions

You can use them like:

```ts
import { createBurnerAccount, mudTransportObserver } from "@latticexyz/common";
import { mudFoundry } from "@latticexyz/common/chains";

createWalletClient({
  account: createBurnerAccount(privateKey),
  chain: mudFoundry,
  transport: mudTransportObserver(http()),
  pollingInterval: 1000,
});
```

**[feat(store-indexer,store-sync): make chain optional, configure indexer with RPC (#1234)](https://github.com/latticexyz/mud/commit/131c63e539a8e9947835dcc323c8b37562aed9ca)** (@latticexyz/store-indexer, @latticexyz/store-sync)

- Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
- Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Export `singletonEntity` as const rather than within the `syncToRecs` result.

```diff
- const { singletonEntity, ... } = syncToRecs({ ... });
+ import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
+ const { ... } = syncToRecs({ ... });
```

**[feat(schema-type): add type narrowing isStaticAbiType (#1196)](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07)** (@latticexyz/schema-type)

add type narrowing `isStaticAbiType`

**[feat(common): move zero gas fee override to `createContract` (#1266)](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983)** (@latticexyz/common)

- Moves zero gas fee override to `createContract` until https://github.com/wagmi-dev/viem/pull/963 or similar feature lands
- Skip simulation if `gas` is provided

## Patch changes

**[fix(cli): add support for legacy transactions in deploy script (#1178)](https://github.com/latticexyz/mud/commit/168a4cb43ce4f7bfbdb7b1b9d4c305b912a0d3f2)** (@latticexyz/cli)

Add support for legacy transactions in deploy script by falling back to `gasPrice` if `lastBaseFeePerGas` is not available

**[feat: protocol-parser in go (#1116)](https://github.com/latticexyz/mud/commit/3236f799e501be227da6e42e7b41a4928750115c)** (@latticexyz/services)

protocol-parser in Go

**[refactor(store): optimize Storage library (#1194)](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021)** (@latticexyz/store)

Optimize storage library

**[feat(common): remove need for tx queue in `createContract` (#1271)](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb)** (@latticexyz/common)

- Remove need for tx queue in `createContract`

**[feat(store-sync): add block numbers to SyncProgress (#1228)](https://github.com/latticexyz/mud/commit/57a5260830401c9ad93196a895a50b0fc4a86183)** (@latticexyz/store-sync)

Adds `latestBlockNumber` and `lastBlockNumberProcessed` to internal `SyncProgress` component

**[feat(store-sync): sync to RECS (#1197)](https://github.com/latticexyz/mud/commit/9e5baf4fff0c60615b8f2b4645fb11cb78cb0bd8)** (@latticexyz/store-sync)

Add RECS sync strategy and corresponding utils

```ts
import { createPublicClient, http } from 'viem';
import { syncToRecs } from '@latticexyz/store-sync';
import storeConfig from 'contracts/mud.config';
import { defineContractComponents } from './defineContractComponents';

const publicClient = createPublicClient({
  chain,
  transport: http(),
  pollingInterval: 1000,
});

const { components, singletonEntity, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
  world,
  config: storeConfig,
  address: '0x...',
  publicClient,
  components: defineContractComponents(...),
});
```

**[fix(store): align Store event names between IStoreWrite and StoreCore (#1237)](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206)** (@latticexyz/store)

Align Store events parameter naming between IStoreWrite and StoreCore

**[fix(cli): explicit import of world as type (#1206)](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b)** (@latticexyz/cli, @latticexyz/std-client)

Generated `contractComponents` now properly import `World` as type

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Add `startBlock` option to `syncToRecs`.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import worlds from "contracts/worlds.json";

syncToRecs({
  startBlock: worlds['31337'].blockNumber,
  ...
});
```

**[chore: pin node to 18.16.1 (#1200)](https://github.com/latticexyz/mud/commit/0d1a7e03a0c8258c76d0b4b76a1a558ae07bbf85)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

**[feat(cli,recs,std-client): update RECS components with v2 key/value schemas (#1195)](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd)** (@latticexyz/cli, @latticexyz/recs, @latticexyz/std-client)

Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

- `component.id` is now the on-chain `bytes32` hex representation of the table ID
- `component.metadata.componentName` is the table name (e.g. `Position`)
- `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
- `component.metadata.keySchema` is an object with key names and their corresponding ABI types
- `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

**[refactor(store): update tightcoder codegen, optimize TightCoder library (#1210)](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)** (@latticexyz/common, @latticexyz/store, @latticexyz/world)

- Refactor tightcoder to use typescript functions instead of ejs
- Optimize `TightCoder` library
- Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers

---

# Version 2.0.0-next.0

## Minor changes

**[feat(store-sync): add store sync package (#1075)](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9)** (@latticexyz/block-logs-stream, @latticexyz/protocol-parser, @latticexyz/store-sync, @latticexyz/store)

Add store sync package

**[feat(protocol-parser): add abiTypesToSchema (#1100)](https://github.com/latticexyz/mud/commit/b98e51808aaa29f922ac215cf666cf6049e692d6)** (@latticexyz/protocol-parser)

feat: add abiTypesToSchema, a util to turn a list of abi types into a Schema by separating static and dynamic types

**[chore(protocol-parser): add changeset for #1099 (#1111)](https://github.com/latticexyz/mud/commit/ca50fef8108422a121d03571fb4679060bd4891a)** (@latticexyz/protocol-parser)

feat: add `encodeKeyTuple`, a util to encode key tuples in Typescript (equivalent to key tuple encoding in Solidity and inverse of `decodeKeyTuple`).
Example:

```ts
encodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
  42n,
  -42,
  "0x12340000000000000000000000000000",
  "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
  true,
  3,
]);
// [
//  "0x000000000000000000000000000000000000000000000000000000000000002a",
//  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
//  "0x1234000000000000000000000000000000000000000000000000000000000000",
//  "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
//  "0x0000000000000000000000000000000000000000000000000000000000000001",
//  "0x0000000000000000000000000000000000000000000000000000000000000003",
// ]
```

**[feat(store-sync): rework blockLogsToStorage (#1176)](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234)** (@latticexyz/block-logs-stream, @latticexyz/store-sync)

- Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.
- Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

**[feat(block-logs-stream): add block logs stream package (#1070)](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75)** (@latticexyz/block-logs-stream)

Add block logs stream package

```ts
import { filter, map, mergeMap } from "rxjs";
import { createPublicClient, parseAbi } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  groupLogsByBlockNumber,
  blockRangeToLogs,
} from "@latticexyz/block-logs-stream";

const publicClient = createPublicClient({
  // your viem public client config here
});

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

latestBlockNumber$
  .pipe(
    map((latestBlockNumber) => ({ startBlock: 0n, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: parseAbi([
        "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
        "event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)",
        "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
        "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
      ]),
    }),
    mergeMap(({ logs }) => from(groupLogsByBlockNumber(logs)))
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```

**[feat(gas-report): create package, move relevant files to it (#1147)](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/store)

Create gas-report package, move gas-report cli command and GasReporter contract to it

**[refactor(store,world): replace isStore with storeAddress (#1061)](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda)** (@latticexyz/std-contracts, @latticexyz/store, @latticexyz/world)

Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

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

**[feat(store-sync): sync to sqlite (#1185)](https://github.com/latticexyz/mud/commit/69a96f109065ae2564a340208d5f9a0be3616747)** (@latticexyz/store-sync)

`blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createPublicClient } from "viem";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { sqliteStorage } from "@latticexyz/store-sync/sqlite";

const database = drizzle(new Database('store.db')) as any as BaseSQLiteDatabase<"sync", void>;
const publicClient = createPublicClient({ ... });

blockLogs$
  .pipe(
    concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
    tap(({ blockNumber, operations }) => {
      console.log("stored", operations.length, "operations for block", blockNumber);
    })
  )
  .subscribe();
```

**[feat(common): new utils, truncate table ID parts (#1173)](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)** (@latticexyz/common)

`TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

Also adds a few utils we'll need in the indexer:

- `bigIntMin` is similar to `Math.min` but for `bigint`s
- `bigIntMax` is similar to `Math.max` but for `bigint`s
- `bigIntSort` for sorting an array of `bigint`s
- `chunk` to split an array into chunks
- `wait` returns a `Promise` that resolves after specified number of milliseconds

**[feat(cli): update set-version to match new release structure, add `--tag`, `--commit` (#1157)](https://github.com/latticexyz/mud/commit/c36ffd13c3d859d9a4eadd0e07f6f73ad96b54aa)** (@latticexyz/cli)

- update the `set-version` cli command to work with the new release process by adding two new options:
  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
- `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

Example:

```bash
pnpm mud set-version --tag main && pnpm install
pnpm mud set-version --commit db19ea39 && pnpm install
```

## Patch changes

**[fix(protocol-parser): properly decode empty records (#1177)](https://github.com/latticexyz/mud/commit/4bb7e8cbf0da45c85b70532dc73791e0e2e1d78c)** (@latticexyz/protocol-parser)

`decodeRecord` now properly decodes empty records

**[refactor(store): clean up Memory, make mcopy pure (#1153)](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world)

Clean up Memory.sol, make mcopy pure

**[fix(recs): improve messages for v2 components (#1167)](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c)** (@latticexyz/recs)

improve RECS error messages for v2 components

**[test: bump forge-std and ds-test (#1168)](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/schema-type, @latticexyz/solecs, @latticexyz/std-contracts, @latticexyz/store, @latticexyz/world, create-mud)

bump forge-std and ds-test dependencies

**[fix(schema-type): fix byte lengths for uint64/int64 (#1175)](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3)** (@latticexyz/schema-type)

Fix byte lengths for `uint64` and `int64`.

**[build: bump TS (#1165)](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b)** (@latticexyz/cli, create-mud, @latticexyz/utils, @latticexyz/world)

bump to latest TS version (5.1.6)

**[build: bump viem, abitype (#1179)](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/std-client, @latticexyz/store-cache, @latticexyz/store-sync, @latticexyz/store)

- bump to viem 1.3.0 and abitype 0.9.3
- move `@wagmi/chains` imports to `viem/chains`
- refine a few types

**[test(e2e): add more test cases (#1074)](https://github.com/latticexyz/mud/commit/086be4ef4f3c1ecb3eac0e9554d7d4eb64531fc2)** (@latticexyz/services)

fix a bug related to encoding negative bigints in MODE

**[fix: remove devEmit when sending events from SyncWorker (#1109)](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

---
