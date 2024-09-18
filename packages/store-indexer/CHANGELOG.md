# @latticexyz/store-indexer

## 2.2.4

### Patch Changes

- 50010fb: Bumped viem, wagmi, and abitype packages to their latest release.

  MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
  ```

- Updated dependencies [2f935cf]
- Updated dependencies [50010fb]
- Updated dependencies [8b4110e]
  - @latticexyz/common@2.2.4
  - @latticexyz/block-logs-stream@2.2.4
  - @latticexyz/protocol-parser@2.2.4
  - @latticexyz/store-sync@2.2.4
  - @latticexyz/store@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/store-sync@2.2.3
- @latticexyz/block-logs-stream@2.2.3
- @latticexyz/common@2.2.3
- @latticexyz/protocol-parser@2.2.3
- @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/block-logs-stream@2.2.2
- @latticexyz/common@2.2.2
- @latticexyz/protocol-parser@2.2.2
- @latticexyz/store@2.2.2
- @latticexyz/store-sync@2.2.2

## 2.2.1

### Patch Changes

- Updated dependencies [603b2ab]
- Updated dependencies [c0764a5]
  - @latticexyz/store-sync@2.2.1
  - @latticexyz/common@2.2.1
  - @latticexyz/block-logs-stream@2.2.1
  - @latticexyz/protocol-parser@2.2.1
  - @latticexyz/store@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [69cd0a1]
- Updated dependencies [04c675c]
  - @latticexyz/common@2.2.0
  - @latticexyz/store@2.2.0
  - @latticexyz/block-logs-stream@2.2.0
  - @latticexyz/protocol-parser@2.2.0
  - @latticexyz/store-sync@2.2.0

## 2.1.1

### Patch Changes

- 6435481: Upgrade `zod` to `3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).
- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- Updated dependencies [6435481]
- Updated dependencies [9e21e42]
- Updated dependencies [2daaab1]
- Updated dependencies [57bf8c3]
  - @latticexyz/store-sync@2.1.1
  - @latticexyz/block-logs-stream@2.1.1
  - @latticexyz/common@2.1.1
  - @latticexyz/protocol-parser@2.1.1
  - @latticexyz/store@2.1.1

## 2.1.0

### Patch Changes

- b62cf9f: Updated return values to match updated types in `@latticexyz/store-sync`.
- Updated dependencies [24e285d]
- Updated dependencies [9e05278]
- Updated dependencies [f640fef]
- Updated dependencies [7129a16]
- Updated dependencies [3440a86]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [a10b453]
- Updated dependencies [69eb63b]
- Updated dependencies [8d0453e]
- Updated dependencies [fb1cfef]
  - @latticexyz/store@2.1.0
  - @latticexyz/store-sync@2.1.0
  - @latticexyz/common@2.1.0
  - @latticexyz/protocol-parser@2.1.0
  - @latticexyz/block-logs-stream@2.1.0

## 2.0.12

### Patch Changes

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
- Updated dependencies [96e7bf430]
  - @latticexyz/store@2.0.12
  - @latticexyz/block-logs-stream@2.0.12
  - @latticexyz/common@2.0.12
  - @latticexyz/protocol-parser@2.0.12
  - @latticexyz/store-sync@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/block-logs-stream@2.0.11
- @latticexyz/common@2.0.11
- @latticexyz/protocol-parser@2.0.11
- @latticexyz/store@2.0.11
- @latticexyz/store-sync@2.0.11

## 2.0.10

### Patch Changes

- 0d4e302f: Fixed the `distance_from_follow_block` gauge to be a positive number if the latest processed block is lagging behind the latest remote block.
- 4caca05e: Bumped zod dependency to comply with abitype peer dependencies.
- Updated dependencies [4e4e9104]
- Updated dependencies [51b137d3]
- Updated dependencies [36e1f766]
- Updated dependencies [32c1cda6]
- Updated dependencies [4caca05e]
- Updated dependencies [27f888c7]
  - @latticexyz/store@2.0.10
  - @latticexyz/common@2.0.10
  - @latticexyz/store-sync@2.0.10
  - @latticexyz/block-logs-stream@2.0.10
  - @latticexyz/protocol-parser@2.0.10

## 2.0.9

### Patch Changes

- 93690fdb: Added a `distance_from_follow_block` metric to compare the latest stored block number with the block number corresponding to the block tag the indexer follows.
- Updated dependencies [764ca0a0]
- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/store-sync@2.0.9
  - @latticexyz/common@2.0.9
  - @latticexyz/block-logs-stream@2.0.9
  - @latticexyz/protocol-parser@2.0.9
  - @latticexyz/store@2.0.9

## 2.0.8

### Patch Changes

- 65aa32c2: Added support for an empty `STORE_ADDRESS=` environment variable.
  This previously would fail the input validation, now it behaves the same way as not setting the `STORE_ADDRESS` variable at all.
- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/block-logs-stream@2.0.8
  - @latticexyz/protocol-parser@2.0.8
  - @latticexyz/store@2.0.8
  - @latticexyz/store-sync@2.0.8

## 2.0.7

### Patch Changes

- 27c4fdee: Add Prometheus metrics at `/metrics` to the Postgres indexer backend and frontend, as well as the SQLite indexer.
- Updated dependencies [375d902e]
- Updated dependencies [bf16e729]
- Updated dependencies [16695fea]
- Updated dependencies [38c61158]
- Updated dependencies [ed404b7d]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/block-logs-stream@2.0.7
  - @latticexyz/store-sync@2.0.7
  - @latticexyz/store@2.0.7
  - @latticexyz/protocol-parser@2.0.7

## 2.0.6

### Patch Changes

- 36354994: Added `Cache-Control` and `Content-Type` headers to the postgres indexer API.
- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [103db6ce]
- Updated dependencies [9720b568]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
- Updated dependencies [de3bc3d1]
- Updated dependencies [8c3dcf77]
  - @latticexyz/common@2.0.6
  - @latticexyz/store@2.0.6
  - @latticexyz/block-logs-stream@2.0.6
  - @latticexyz/protocol-parser@2.0.6
  - @latticexyz/store-sync@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [a9e8a407]
- Updated dependencies [b798ccb2]
  - @latticexyz/common@2.0.5
  - @latticexyz/store@2.0.5
  - @latticexyz/block-logs-stream@2.0.5
  - @latticexyz/protocol-parser@2.0.5
  - @latticexyz/store-sync@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/block-logs-stream@2.0.4
  - @latticexyz/protocol-parser@2.0.4
  - @latticexyz/store@2.0.4
  - @latticexyz/store-sync@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/block-logs-stream@2.0.3
  - @latticexyz/protocol-parser@2.0.3
  - @latticexyz/store@2.0.3
  - @latticexyz/store-sync@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/store-sync@2.0.2
- @latticexyz/block-logs-stream@2.0.2
- @latticexyz/common@2.0.2
- @latticexyz/protocol-parser@2.0.2
- @latticexyz/store@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/store-sync@2.0.1
  - @latticexyz/block-logs-stream@2.0.1
  - @latticexyz/common@2.0.1
  - @latticexyz/protocol-parser@2.0.1

## 2.0.0

### Major Changes

- e86fbc126: Adds store indexer service package with utils to query the indexer service.

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

- f6d214e3d: Removed `tableIds` filter option in favor of the more flexible `filters` option that accepts `tableId` and an optional `key0` and/or `key1` to filter data by tables and keys.

  If you were using an indexer client directly, you'll need to update your query:

  ```diff
    await indexer.findAll.query({
      chainId,
      address,
  -   tableIds: ['0x...'],
  +   filters: [{ tableId: '0x...' }],
    });
  ```

- b621fb977: Adds a [Fastify](https://fastify.dev/) server in front of tRPC and puts tRPC endpoints under `/trpc` to make way for other top-level endpoints (e.g. [tRPC panel](https://github.com/iway1/trpc-panel) or other API frontends like REST or gRPC).

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

- 85b94614b: The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.
- 5ecccfe75: Separated frontend server and indexer service for Postgres indexer. Now you can run the Postgres indexer with one writer and many readers.

  If you were previously using the `postgres-indexer` binary, you'll now need to run both `postgres-indexer` and `postgres-frontend`.

  For consistency, the Postgres database logs are now disabled by default. If you were using these, please let us know so we can add them back in with an environment variable flag.

- adc68225: PostgreSQL sync/indexer now uses `{storeAddress}` for its database schema names and `{namespace}__{tableName}` for its database table names (or just `{tableName}` for root namespace), to be more consistent with the rest of the MUD codebase.

  For namespaced tables:

  ```diff
  - SELECT * FROM 0xfff__some_ns.some_table
  + SELECT * FROM 0xfff.some_ns__some_table
  ```

  For root tables:

  ```diff
  - SELECT * FROM 0xfff__.some_table
  + SELECT * FROM 0xfff.some_table
  ```

  SQLite sync/indexer now uses snake case for its table names and column names for easier writing of queries and to better match PostgreSQL sync/indexer naming.

  ```diff
  - SELECT * FROM 0xfFf__someNS__someTable
  + SELECT * FROM 0xfff__some_ns__some_table
  ```

### Minor Changes

- 3622e39dd: Added a `followBlockTag` option to configure which block number to follow when running `createStoreSync`. It defaults to `latest` (current behavior), which is recommended for individual clients so that you always have the latest chain state.

  Indexers now default to `safe` to avoid issues with reorgs and load-balanced RPCs being out of sync. This means indexers will be slightly behind the latest block number, but clients can quickly catch up. Indexers can override this setting using `FOLLOW_BLOCK_TAG` environment variable.

- 131c63e53: - Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
  - Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.
- 4081493b8: Added a `tableIds` parameter to store sync methods and indexer to allow filtering data streams by table IDs. Store sync methods automatically include all internal table IDs from Store and World.

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { resourceIdToHex } from "@latticexyz/common";

  syncToRecs({
    ...
    tableIds: [resourceIdToHex(...)],
  });
  ```

  ```ts
  import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
  import { resourceIdToHex } from "@latticexyz/common";

  const client = createIndexerClient({ ... });
  client.findAll({
    ...
    tableIds: [resourceIdToHex(...)],
  });
  ```

- 498d05e36: You can now install and run `@latticexyz/store-indexer` from the npm package itself, without having to clone/build the MUD repo:

  ```sh
  npm install @latticexyz/store-indexer

  npm sqlite-indexer
  # or
  npm postgres-indexer
  ```

  or

  ```sh
  npx -p @latticexyz/store-indexer sqlite-indexer
  # or
  npx -p @latticexyz/store-indexer postgres-indexer
  ```

  The binary will also load the nearby `.env` file for easier local configuration.

  We've removed the `CHAIN_ID` requirement and instead require just a `RPC_HTTP_URL` or `RPC_WS_URL` or both. You can now also adjust the polling interval with `POLLING_INTERVAL` (defaults to 1000ms, which corresponds to MUD's default block time).

- 1b5eb0d07: The `findAll` method is now considered deprecated in favor of a new `getLogs` method. This is only implemented in the Postgres indexer for now, with SQLite coming soon. The new `getLogs` method will be an easier and more robust data source to hydrate the client and other indexers and will allow us to add streaming updates from the indexer in the near future.

  For backwards compatibility, `findAll` is now implemented on top of `getLogs`, with record key/value decoding done in memory at request time. This may not scale for large databases, so use wisely.

- 753bdce41: Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

- e48fb3b03: When the Postgres indexer starts up, it will now attempt to detect if the database is outdated and, if so, cleans up all MUD-related schemas and tables before proceeding.
- 1d0f7e22b: Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes
- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

- 5df1f31bc: Added `getLogs` query support to sqlite indexer
- 4c1dcd81e: - Improved query performance by 10x by moving from drizzle ORM to handcrafted SQL.

  - Moved away from `trpc` for more granular control over the transport layer.
    Added an `/api/logs` endpoint using the new query and gzip compression for 40x less data transferred over the wire.
    Deprecated the `/trpc/getLogs` and `/trpc/findAll` endpoints.
  - Added a `createIndexerClient` client for the new `/api` indexer API exported from `@latticexyz/store-sync/indexer-client`.
    The `createIndexerClient` export from `@latticexyz/store-sync/trpc-indexer` is deprecated.

  ```diff
  - import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
  + import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";

  - const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz/trpc" });
  + const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz" });

  - const snapshot = indexer.getLogs.query(options);
  + const snapshot = indexer.getLogs(options);
  ```

- f61b4bc09: The `/api/logs` indexer endpoint is now returning a `404` snapshot not found error when no snapshot is found for the provided filter instead of an empty `200` response.
- f318f2fe7: Added `STORE_ADDRESS` environment variable to index only a specific MUD Store.

### Patch Changes

- 504e25dc8: Records are now ordered by `lastUpdatedBlockNumber` at the Postgres SQL query level
- ed07018b8: Fixes postgres indexer stopping sync after it catches up to the latest block.
- b00550cef: Added a script to run the decoded postgres indexer.
- 0a3b9b1c9: Added explicit error logs for unexpected situations.
  Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
  Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.
- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- 85d16e48b: Added a Sentry middleware and `SENTRY_DNS` environment variable to the postgres indexer.
- c314badd1: Replaced Fastify with Koa for store-indexer frontends
- 301bcb75d: Improves error message when parsing env variables
- b8a6158d6: bump viem to 1.6.0
- 392c4b88d: Disabled prepared statements for the postgres indexer, which led to issues in combination with `pgBouncer`.
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 5ab67e335: The error log if no data is found in `/api/logs` is now stringifying the filter instead of logging `[object Object]`.
- 735d957c6: Added a binary for the `postgres-decoded` indexer.
- 60cfd089f: Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

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
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
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

- b3c22a183: Added README and refactored handling of common environment variables
- Updated dependencies [7ce82b6fc]
- Updated dependencies [5df1f31bc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [3622e39dd]
- Updated dependencies [c963b46c7]
- Updated dependencies [08d7c471f]
- Updated dependencies [05b3e8882]
- Updated dependencies [16b13ea8f]
- Updated dependencies [aea67c580]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [331dbfdcb]
- Updated dependencies [504e25dc8]
- Updated dependencies [e86fbc126]
- Updated dependencies [d5c0682fb]
- Updated dependencies [1d60930d6]
- Updated dependencies [01e46d99]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [de47d698f]
- Updated dependencies [e48fb3b03]
- Updated dependencies [2c920de7]
- Updated dependencies [b98e51808]
- Updated dependencies [0a3b9b1c9]
- Updated dependencies [b9e562d8f]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [6c615b608]
- Updated dependencies [3fb9ce283]
- Updated dependencies [bb6ada740]
- Updated dependencies [85b94614b]
- Updated dependencies [35c9f33df]
- Updated dependencies [a25881160]
- Updated dependencies [a4aff73c5]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [57a526083]
- Updated dependencies [f62c767e7]
- Updated dependencies [9e5baf4ff]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [37c228c63]
- Updated dependencies [aacffcb59]
- Updated dependencies [c991c71a]
- Updated dependencies [1faf7f697]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [b38c096d]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [4bb7e8cbf]
- Updated dependencies [131c63e53]
- Updated dependencies [712866f5f]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [d5b73b126]
- Updated dependencies [e34d1170]
- Updated dependencies [b8a6158d6]
- Updated dependencies [190fdd11]
- Updated dependencies [4e445a1ab]
- Updated dependencies [433078c54]
- Updated dependencies [669fa43e5]
- Updated dependencies [db314a74]
- Updated dependencies [b2d2aa715]
- Updated dependencies [ca50fef81]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [582388ba5]
- Updated dependencies [6573e38e9]
- Updated dependencies [eeb15cc06]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [59267655]
- Updated dependencies [37c228c63]
- Updated dependencies [997286bac]
- Updated dependencies [72b806979]
- Updated dependencies [4081493b8]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [582388ba5]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [a735e14b4]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [f8a01a047]
- Updated dependencies [3e024fcf3]
- Updated dependencies [f62c767e7]
- Updated dependencies [590542030]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [55a05fd7a]
- Updated dependencies [7e6e5157b]
- Updated dependencies [63831a264]
- Updated dependencies [b8a6158d6]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [a7b30c79b]
- Updated dependencies [92de59982]
- Updated dependencies [22ee44700]
- Updated dependencies [1327ea8c8]
- Updated dependencies [ad4ac4459]
- Updated dependencies [f6d214e3d]
- Updated dependencies [3f5d33af]
- Updated dependencies [b8a6158d6]
- Updated dependencies [be313068b]
- Updated dependencies [ac508bf18]
- Updated dependencies [331dbfdcb]
- Updated dependencies [9ff4dd955]
- Updated dependencies [93390d89]
- Updated dependencies [fa7763583]
- Updated dependencies [bb91edaa0]
- Updated dependencies [144c0d8d]
- Updated dependencies [5ac4c97f4]
- Updated dependencies [bfcb293d1]
- Updated dependencies [3e057061d]
- Updated dependencies [1890f1a06]
- Updated dependencies [e48171741]
- Updated dependencies [753bdce41]
- Updated dependencies [5294a7d59]
- Updated dependencies [69a96f109]
- Updated dependencies [9b43029c3]
- Updated dependencies [37c228c63]
- Updated dependencies [55ab88a60]
- Updated dependencies [c58da9ad]
- Updated dependencies [37c228c63]
- Updated dependencies [b8a6158d6]
- Updated dependencies [535229984]
- Updated dependencies [af639a264]
- Updated dependencies [5e723b90e]
- Updated dependencies [99ab9cd6f]
- Updated dependencies [0c4f9fea9]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [34203e4ed]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [25086be5f]
- Updated dependencies [b1d41727d]
- Updated dependencies [3ac68ade6]
- Updated dependencies [22ba7b675]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [3042f86e]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [7eabd06f7]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [8025c3505]
- Updated dependencies [c4f49240d]
- Updated dependencies [745485cda]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [a2f41ade9]
- Updated dependencies [cea754dde]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [331f0d636]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [d2f8e9400]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [adc68225]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [7b73f44d9]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/store-sync@2.0.0
  - @latticexyz/common@2.0.0
  - @latticexyz/protocol-parser@2.0.0
  - @latticexyz/block-logs-stream@2.0.0

## 2.0.0-next.18

### Major Changes

- adc68225: PostgreSQL sync/indexer now uses `{storeAddress}` for its database schema names and `{namespace}__{tableName}` for its database table names (or just `{tableName}` for root namespace), to be more consistent with the rest of the MUD codebase.

  For namespaced tables:

  ```diff
  - SELECT * FROM 0xfff__some_ns.some_table
  + SELECT * FROM 0xfff.some_ns__some_table
  ```

  For root tables:

  ```diff
  - SELECT * FROM 0xfff__.some_table
  + SELECT * FROM 0xfff.some_table
  ```

  SQLite sync/indexer now uses snake case for its table names and column names for easier writing of queries and to better match PostgreSQL sync/indexer naming.

  ```diff
  - SELECT * FROM 0xfFf__someNS__someTable
  + SELECT * FROM 0xfff__some_ns__some_table
  ```

### Minor Changes

- 3622e39dd: Added a `followBlockTag` option to configure which block number to follow when running `createStoreSync`. It defaults to `latest` (current behavior), which is recommended for individual clients so that you always have the latest chain state.

  Indexers now default to `safe` to avoid issues with reorgs and load-balanced RPCs being out of sync. This means indexers will be slightly behind the latest block number, but clients can quickly catch up. Indexers can override this setting using `FOLLOW_BLOCK_TAG` environment variable.

- d7b1c588a: Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

  Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

  ```diff
   const worldContract = getContract({
     address: worldAddress,
     abi: IWorldAbi,
  -  publicClient,
  -  walletClient,
  +  client: { public: publicClient, wallet: walletClient },
   });
  ```

### Patch Changes

- Updated dependencies [c9ee5e4a]
- Updated dependencies [3622e39dd]
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [c991c71a]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [190fdd11]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [8193136a9]
- Updated dependencies [3f5d33af]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [c58da9ad]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [3e7d83d0]
- Updated dependencies [adc68225]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/store-sync@2.0.0-next.18
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/protocol-parser@2.0.0-next.18
  - @latticexyz/block-logs-stream@2.0.0-next.18

## 2.0.0-next.17

### Patch Changes

- Updated dependencies [a35c05ea]
- Updated dependencies [05b3e888]
- Updated dependencies [aabd3076]
- Updated dependencies [6c615b60]
- Updated dependencies [4e445a1a]
- Updated dependencies [669fa43e]
- Updated dependencies [997286ba]
- Updated dependencies [c162ad5a]
- Updated dependencies [55a05fd7]
- Updated dependencies [5c52bee0]
- Updated dependencies [745485cd]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/store@2.0.0-next.17
  - @latticexyz/store-sync@2.0.0-next.17
  - @latticexyz/block-logs-stream@2.0.0-next.17
  - @latticexyz/protocol-parser@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- Updated dependencies [c6c13f2e]
- Updated dependencies [e6c03a87]
- Updated dependencies [37c228c6]
- Updated dependencies [1bf2e908]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [a735e14b]
- Updated dependencies [7b28d32e]
- Updated dependencies [9f8b84e7]
- Updated dependencies [ad4ac445]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [3ac68ade]
- Updated dependencies [37c228c6]
- Updated dependencies [103f635e]
  - @latticexyz/store@2.0.0-next.16
  - @latticexyz/store-sync@2.0.0-next.16
  - @latticexyz/block-logs-stream@2.0.0-next.16
  - @latticexyz/common@2.0.0-next.16
  - @latticexyz/protocol-parser@2.0.0-next.16

## 2.0.0-next.15

### Major Changes

- 85b94614: The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.

### Minor Changes

- 1b5eb0d0: The `findAll` method is now considered deprecated in favor of a new `getLogs` method. This is only implemented in the Postgres indexer for now, with SQLite coming soon. The new `getLogs` method will be an easier and more robust data source to hydrate the client and other indexers and will allow us to add streaming updates from the indexer in the near future.

  For backwards compatibility, `findAll` is now implemented on top of `getLogs`, with record key/value decoding done in memory at request time. This may not scale for large databases, so use wisely.

- e48fb3b0: When the Postgres indexer starts up, it will now attempt to detect if the database is outdated and, if so, cleans up all MUD-related schemas and tables before proceeding.
- 5df1f31b: Added `getLogs` query support to sqlite indexer
- 4c1dcd81: - Improved query performance by 10x by moving from drizzle ORM to handcrafted SQL.

  - Moved away from `trpc` for more granular control over the transport layer.
    Added an `/api/logs` endpoint using the new query and gzip compression for 40x less data transferred over the wire.
    Deprecated the `/trpc/getLogs` and `/trpc/findAll` endpoints.
  - Added a `createIndexerClient` client for the new `/api` indexer API exported from `@latticexyz/store-sync/indexer-client`.
    The `createIndexerClient` export from `@latticexyz/store-sync/trpc-indexer` is deprecated.

  ```diff
  - import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
  + import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";

  - const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz/trpc" });
  + const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz" });

  - const snapshot = indexer.getLogs.query(options);
  + const snapshot = indexer.getLogs(options);
  ```

- f61b4bc0: The `/api/logs` indexer endpoint is now returning a `404` snapshot not found error when no snapshot is found for the provided filter instead of an empty `200` response.

### Patch Changes

- 504e25dc: Records are now ordered by `lastUpdatedBlockNumber` at the Postgres SQL query level
- b00550ce: Added a script to run the decoded postgres indexer.
- 0a3b9b1c: Added explicit error logs for unexpected situations.
  Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
  Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.
- 85d16e48: Added a Sentry middleware and `SENTRY_DNS` environment variable to the postgres indexer.
- c314badd: Replaced Fastify with Koa for store-indexer frontends
- 392c4b88: Disabled prepared statements for the postgres indexer, which led to issues in combination with `pgBouncer`.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 5ab67e33: The error log if no data is found in `/api/logs` is now stringifying the filter instead of logging `[object Object]`.
- 735d957c: Added a binary for the `postgres-decoded` indexer.
- Updated dependencies [5df1f31b]
- Updated dependencies [d8c8f66b]
- Updated dependencies [1b86eac0]
- Updated dependencies [504e25dc]
- Updated dependencies [1077c7f5]
- Updated dependencies [e48fb3b0]
- Updated dependencies [0a3b9b1c]
- Updated dependencies [85b94614]
- Updated dependencies [a4aff73c]
- Updated dependencies [933b54b5]
- Updated dependencies [712866f5]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [6db95ce1]
- Updated dependencies [5d737cf2]
- Updated dependencies [5ac4c97f]
- Updated dependencies [e4817174]
- Updated dependencies [34203e4e]
- Updated dependencies [4c1dcd81]
- Updated dependencies [7eabd06f]
- Updated dependencies [5df1f31b]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [4c1dcd81]
- Updated dependencies [7b73f44d]
  - @latticexyz/store-sync@2.0.0-next.15
  - @latticexyz/store@2.0.0-next.15
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/block-logs-stream@2.0.0-next.15
  - @latticexyz/protocol-parser@2.0.0-next.15

## 2.0.0-next.14

### Major Changes

- 5ecccfe7: Separated frontend server and indexer service for Postgres indexer. Now you can run the Postgres indexer with one writer and many readers.

  If you were previously using the `postgres-indexer` binary, you'll now need to run both `postgres-indexer` and `postgres-frontend`.

  For consistency, the Postgres database logs are now disabled by default. If you were using these, please let us know so we can add them back in with an environment variable flag.

### Minor Changes

- f318f2fe: Added `STORE_ADDRESS` environment variable to index only a specific MUD Store.

### Patch Changes

- Updated dependencies [aacffcb5]
- Updated dependencies [1faf7f69]
- Updated dependencies [b2d2aa71]
- Updated dependencies [1327ea8c]
- Updated dependencies [bb91edaa]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/store-sync@2.0.0-next.14
  - @latticexyz/store@2.0.0-next.14
  - @latticexyz/block-logs-stream@2.0.0-next.14
  - @latticexyz/protocol-parser@2.0.0-next.14

## 2.0.0-next.13

### Major Changes

- f6d214e3: Removed `tableIds` filter option in favor of the more flexible `filters` option that accepts `tableId` and an optional `key0` and/or `key1` to filter data by tables and keys.

  If you were using an indexer client directly, you'll need to update your query:

  ```diff
    await indexer.findAll.query({
      chainId,
      address,
  -   tableIds: ['0x...'],
  +   filters: [{ tableId: '0x...' }],
    });
  ```

### Patch Changes

- Updated dependencies [de47d698]
- Updated dependencies [f6d214e3]
- Updated dependencies [fa776358]
- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/store-sync@2.0.0-next.13
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/block-logs-stream@2.0.0-next.13
  - @latticexyz/protocol-parser@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13

## 2.0.0-next.12

### Minor Changes

- 1d0f7e22: Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes

### Patch Changes

- Updated dependencies [7ce82b6f]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [d2f8e940]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/store-sync@2.0.0-next.12
  - @latticexyz/block-logs-stream@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [08d7c471]
- Updated dependencies [16b13ea8]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/store-sync@2.0.0-next.11
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/block-logs-stream@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11

## 2.0.0-next.10

### Minor Changes

- [#1662](https://github.com/latticexyz/mud/pull/1662) [`4081493b`](https://github.com/latticexyz/mud/commit/4081493b84ab5c78a5147d4af8d41fc2d9e027a5) Thanks [@holic](https://github.com/holic)! - Added a `tableIds` parameter to store sync methods and indexer to allow filtering data streams by table IDs. Store sync methods automatically include all internal table IDs from Store and World.

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { resourceIdToHex } from "@latticexyz/common";

  syncToRecs({
    ...
    tableIds: [resourceIdToHex(...)],
  });
  ```

  ```ts
  import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
  import { resourceIdToHex } from "@latticexyz/common";

  const client = createIndexerClient({ ... });
  client.findAll({
    ...
    tableIds: [resourceIdToHex(...)],
  });
  ```

### Patch Changes

- Updated dependencies [[`4081493b`](https://github.com/latticexyz/mud/commit/4081493b84ab5c78a5147d4af8d41fc2d9e027a5)]:
  - @latticexyz/store-sync@2.0.0-next.10
  - @latticexyz/block-logs-stream@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10

## 2.0.0-next.9

### Minor Changes

- [#1526](https://github.com/latticexyz/mud/pull/1526) [`498d05e3`](https://github.com/latticexyz/mud/commit/498d05e3604cd422064e5548dc53bec327e936ee) Thanks [@holic](https://github.com/holic)! - You can now install and run `@latticexyz/store-indexer` from the npm package itself, without having to clone/build the MUD repo:

  ```sh
  npm install @latticexyz/store-indexer

  npm sqlite-indexer
  # or
  npm postgres-indexer
  ```

  or

  ```sh
  npx -p @latticexyz/store-indexer sqlite-indexer
  # or
  npx -p @latticexyz/store-indexer postgres-indexer
  ```

  The binary will also load the nearby `.env` file for easier local configuration.

  We've removed the `CHAIN_ID` requirement and instead require just a `RPC_HTTP_URL` or `RPC_WS_URL` or both. You can now also adjust the polling interval with `POLLING_INTERVAL` (defaults to 1000ms, which corresponds to MUD's default block time).

### Patch Changes

- [#1514](https://github.com/latticexyz/mud/pull/1514) [`ed07018b`](https://github.com/latticexyz/mud/commit/ed07018b86046fec20786f4752ac98a4175eb5eb) Thanks [@holic](https://github.com/holic)! - Fixes postgres indexer stopping sync after it catches up to the latest block.

- [#1546](https://github.com/latticexyz/mud/pull/1546) [`301bcb75`](https://github.com/latticexyz/mud/commit/301bcb75dd8c15b8ea1a9d0ca8c75c15d7cd92bd) Thanks [@holic](https://github.com/holic)! - Improves error message when parsing env variables

- [#1533](https://github.com/latticexyz/mud/pull/1533) [`b3c22a18`](https://github.com/latticexyz/mud/commit/b3c22a183c0b288b9eb1487e4fef125bf7dae915) Thanks [@holic](https://github.com/holic)! - Added README and refactored handling of common environment variables

- Updated dependencies [[`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`7e6e5157`](https://github.com/latticexyz/mud/commit/7e6e5157bb124f19bd8ed9f02b93afadc97cdf50), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/store-sync@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/block-logs-stream@2.0.0-next.9

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
         filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
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
