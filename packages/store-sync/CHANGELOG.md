# @latticexyz/store-sync

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

### Minor Changes

- [#1240](https://github.com/latticexyz/mud/pull/1240) [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e) Thanks [@holic](https://github.com/holic)! - Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- [#1302](https://github.com/latticexyz/mud/pull/1302) [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb) Thanks [@holic](https://github.com/holic)! - Improves support for internal/client-only RECS components

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - remove usages of `isNonPendingBlock` and `isNonPendingLog` (fixed with more specific viem types)

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/block-logs-stream@2.0.0-next.2
  - @latticexyz/protocol-parser@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2

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

- [#1235](https://github.com/latticexyz/mud/pull/1235) [`582388ba`](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b) Thanks [@holic](https://github.com/holic)! - Export `singletonEntity` as const rather than within the `syncToRecs` result.

  ```diff
  - const { singletonEntity, ... } = syncToRecs({ ... });
  + import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
  + const { ... } = syncToRecs({ ... });
  ```

### Patch Changes

- [#1228](https://github.com/latticexyz/mud/pull/1228) [`57a52608`](https://github.com/latticexyz/mud/commit/57a5260830401c9ad93196a895a50b0fc4a86183) Thanks [@holic](https://github.com/holic)! - Adds `latestBlockNumber` and `lastBlockNumberProcessed` to internal `SyncProgress` component

- [#1197](https://github.com/latticexyz/mud/pull/1197) [`9e5baf4f`](https://github.com/latticexyz/mud/commit/9e5baf4fff0c60615b8f2b4645fb11cb78cb0bd8) Thanks [@holic](https://github.com/holic)! - Add RECS sync strategy and corresponding utils

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

- [#1235](https://github.com/latticexyz/mud/pull/1235) [`582388ba`](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b) Thanks [@holic](https://github.com/holic)! - Add `startBlock` option to `syncToRecs`.

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import worlds from "contracts/worlds.json";

  syncToRecs({
    startBlock: worlds['31337'].blockNumber,
    ...
  });
  ```

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- Updated dependencies [[`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1
  - @latticexyz/recs@2.0.0-next.1
  - @latticexyz/block-logs-stream@2.0.0-next.1
  - @latticexyz/protocol-parser@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1176](https://github.com/latticexyz/mud/pull/1176) [`eeb15cc0`](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234) Thanks [@holic](https://github.com/holic)! - - Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.

  - Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

- [#1185](https://github.com/latticexyz/mud/pull/1185) [`69a96f10`](https://github.com/latticexyz/mud/commit/69a96f109065ae2564a340208d5f9a0be3616747) Thanks [@holic](https://github.com/holic)! - `blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

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

### Patch Changes

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9), [`b98e5180`](https://github.com/latticexyz/mud/commit/b98e51808aaa29f922ac215cf666cf6049e692d6), [`4bb7e8cb`](https://github.com/latticexyz/mud/commit/4bb7e8cbf0da45c85b70532dc73791e0e2e1d78c), [`ca50fef8`](https://github.com/latticexyz/mud/commit/ca50fef8108422a121d03571fb4679060bd4891a), [`eeb15cc0`](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234), [`72b80697`](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75), [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/block-logs-stream@2.0.0-next.0
  - @latticexyz/protocol-parser@2.0.0-next.0
  - @latticexyz/store@2.0.0-next.0
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/store-cache@2.0.0-next.0
