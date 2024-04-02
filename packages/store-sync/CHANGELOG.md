# @latticexyz/store-sync

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/block-logs-stream@2.0.4
  - @latticexyz/config@2.0.4
  - @latticexyz/protocol-parser@2.0.4
  - @latticexyz/query@2.0.4
  - @latticexyz/store@2.0.4
  - @latticexyz/world@2.0.4
  - @latticexyz/recs@2.0.4
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/world@2.0.3
  - @latticexyz/block-logs-stream@2.0.3
  - @latticexyz/config@2.0.3
  - @latticexyz/protocol-parser@2.0.3
  - @latticexyz/query@2.0.3
  - @latticexyz/store@2.0.3
  - @latticexyz/recs@2.0.3
  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [e86bd14d]
- Updated dependencies [a09bf251]
  - @latticexyz/world@2.0.2
  - @latticexyz/block-logs-stream@2.0.2
  - @latticexyz/common@2.0.2
  - @latticexyz/config@2.0.2
  - @latticexyz/protocol-parser@2.0.2
  - @latticexyz/query@2.0.2
  - @latticexyz/recs@2.0.2
  - @latticexyz/schema-type@2.0.2
  - @latticexyz/store@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/world@2.0.1
  - @latticexyz/query@2.0.1
  - @latticexyz/block-logs-stream@2.0.1
  - @latticexyz/common@2.0.1
  - @latticexyz/config@2.0.1
  - @latticexyz/protocol-parser@2.0.1
  - @latticexyz/recs@2.0.1
  - @latticexyz/schema-type@2.0.1

## 2.0.0

### Major Changes

- 07dd6f32c: Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
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

- 504e25dc8: `lastUpdatedBlockNumber` columns in Postgres storage adapters are no longer nullable
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

- e48fb3b03: Renamed singleton `chain` table to `config` table for clarity.
- 85b94614b: The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.
- a4aff73c5: Previously, all `store-sync` strategies were susceptible to a potential memory leak where the stream that fetches logs from the RPC would get ahead of the stream that stores the logs in the provided storage adapter. We saw this most often when syncing to remote Postgres servers, where inserting records was much slower than we retrieving them from the RPC. In these cases, the stream would build up a backlog of items until the machine ran out of memory.

  This is now fixed by waiting for logs to be stored before fetching the next batch of logs from the RPC. To make this strategy work, we no longer return `blockLogs# @latticexyz/store-sync (stream of logs fetched from RPC but before they're stored) and instead just return `storedBlockLogs# @latticexyz/store-sync (stream of logs fetched from RPC after they're stored).

- 1faf7f697: `syncToZustand` now uses `tables` argument to populate the Zustand store's `tables` key, rather than the on-chain table registration events. This means we'll no longer store data into Zustand you haven't opted into receiving (e.g. other namespaces).
- 433078c54: Reverse PackedCounter encoding, to optimize gas for bitshifts.
  Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

  - Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
  - New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

- afaf2f5ff: - `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`

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

- 48c51b52a: RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

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

- 8193136a9: Added `dynamicFieldIndex` to the `Store_SpliceDynamicData` event. This enables indexers to store dynamic data as a blob per dynamic field without a schema lookup.
- 331dbfdcb: We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

  As such, we've replaced `blockStorageOperations# @latticexyz/store-sync with `storedBlockLogs# @latticexyz/store-sync, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

- 1b5eb0d07: `syncToPostgres` from `@latticexyz/store-sync/postgres` now uses a single table to store all records in their bytes form (`staticData`, `encodedLengths`, and `dynamicData`), more closely mirroring onchain state and enabling more scalability and stability for automatic indexing of many worlds.

  The previous behavior, where schemaful SQL tables are created and populated for each MUD table, has been moved to a separate `@latticexyz/store-sync/postgres-decoded` export bundle. This approach is considered less stable and is intended to be used for analytics purposes rather than hydrating clients. Some previous metadata columns on these tables have been removed in favor of the bytes records table as the source of truth for onchain state.

  This overhaul is considered breaking and we recommend starting a fresh database when syncing with either of these strategies.

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

- 252a1852: Migrated to new config format.
- 7b73f44d9: Postgres storage adapter now uses snake case for decoded table names and column names. This allows for better SQL ergonomics when querying these tables.

  To avoid naming conflicts for now, schemas are still case-sensitive and need to be queried with double quotes. We may change this in the future with [namespace validation](https://github.com/latticexyz/mud/issues/1991).

### Minor Changes

- 5df1f31bc: Refactored how we fetch snapshots from an indexer, preferring the new `getLogs` endpoint and falling back to the previous `findAll` if it isn't available. This refactor also prepares for an easier entry point for adding client caching of snapshots.

  The `initialState` option for various sync methods (`syncToPostgres`, `syncToRecs`, etc.) is now deprecated in favor of `initialBlockLogs`. For now, we'll automatically convert `initialState` into `initialBlockLogs`, but if you want to update your code, you can do:

  ```ts
  import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";

  const initialBlockLogs = {
    blockNumber: initialState.blockNumber,
    logs: tablesWithRecordsToLogs(initialState.tables),
  };
  ```

- 3622e39dd: Added a `followBlockTag` option to configure which block number to follow when running `createStoreSync`. It defaults to `latest` (current behavior), which is recommended for individual clients so that you always have the latest chain state.

  Indexers now default to `safe` to avoid issues with reorgs and load-balanced RPCs being out of sync. This means indexers will be slightly behind the latest block number, but clients can quickly catch up. Indexers can override this setting using `FOLLOW_BLOCK_TAG` environment variable.

- 904fd7d4e: Add store sync package
- de47d698f: Added an optional `tables` option to `syncToRecs` to allow you to sync from tables that may not be expressed by your MUD config. This will be useful for namespaced tables used by [ERC20](https://github.com/latticexyz/mud/pull/1789) and [ERC721](https://github.com/latticexyz/mud/pull/1844) token modules until the MUD config gains [namespace support](https://github.com/latticexyz/mud/issues/994).

  Here's how we use this in our example project with the `KeysWithValue` module:

  ```ts
  syncToRecs({
    ...
    tables: {
      KeysWithValue: {
        namespace: "keywval",
        name: "Inventory",
        tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
        keySchema: {
          valueHash: { type: "bytes32" },
        },
        valueSchema: {
          keysWithValue: { type: "bytes32[]" },
        },
      },
    },
    ...
  });
  ```

- 131c63e53: - Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
  - Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.
- eeb15cc06: - Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.
  - Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.
- 997286bac: `createStoreSync` now [waits for idle](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) between each chunk of logs in a block to allow for downstream render cycles to trigger. This means that hydrating logs from an indexer will no longer block until hydration completes, but rather allow for `onProgress` callbacks to trigger.
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

- 582388ba5: Export `singletonEntity` as const rather than within the `syncToRecs` result.

  ```diff
  - const { singletonEntity, ... } = syncToRecs({ ... });
  + import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
  + const { ... } = syncToRecs({ ... });
  ```

- f6d214e3d: Added a `filters` option to store sync to allow filtering client data on tables and keys. Previously, it was only possible to filter on `tableIds`, but the new filter option allows for more flexible filtering by key.

  If you are building a large MUD application, you can use positional keys as a way to shard data and make it possible to load only the data needed in the client for a particular section of your app. We're using this already in Sky Strife to load match-specific data into match pages without having to load data for all matches, greatly improving load time and client performance.

  ```ts
  syncToRecs({
    ...
    filters: [{ tableId: '0x...', key0: '0x...' }],
  });
  ```

  The `tableIds` option is now deprecated and will be removed in the future, but is kept here for backwards compatibility.

- fa7763583: Added a Zustand storage adapter and corresponding `syncToZustand` method for use in vanilla and React apps. It's used much like the other sync methods, except it returns a bound store and set of typed tables.

  ```ts
  import { syncToZustand } from "@latticexyz/store-sync/zustand";
  import config from "contracts/mud.config";

  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
    config,
    ...
  });

  // in vanilla apps
  const positions = useStore.getState().getRecords(tables.Position);

  // in React apps
  const positions = useStore((state) => state.getRecords(tables.Position));
  ```

  This change will be shortly followed by an update to our templates that uses Zustand as the default client data store and sync method.

- 753bdce41: Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

- 69a96f109: `blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

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

- 7eabd06f7: Added and populated `syncProgress` key in Zustand store for sync progress, like we do for RECS sync. This will let apps using `syncToZustand` render a loading state while initial client hydration is in progress.

  ```tsx
  const syncProgress = useStore((state) => state.syncProgress);

  if (syncProgress.step !== SyncStep.LIVE) {
    return <>Loading ({Math.floor(syncProgress.percentage)}%)</>;
  }
  ```

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

### Patch Changes

- 08d7c471f: Export postgres column type helpers from `@latticexyz/store-sync`.
- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 0a3b9b1c9: Added explicit error logs for unexpected situations.
  Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
  Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.
- 6c615b608: Bumped the Postgres column size for `int32`, `uint32`, `int64`, and `uint64` types to avoid overflows
- bb6ada740: Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

  By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

  If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

  ```ts
  const { blockStorageOperations$ } = syncToRecs({
    ...
    startSync: false,
  });

  // start sync manually by subscribing to `blockStorageOperation# @latticexyz/store-sync
  const subcription = blockStorageOperation$.subscribe();

  // clean up subscription
  subscription.unsubscribe();
  ```

- 57a526083: Adds `latestBlockNumber` and `lastBlockNumberProcessed` to internal `SyncProgress` component
- 9e5baf4ff: Add RECS sync strategy and corresponding utils

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

- 712866f5f: `createStoreSync` now correctly creates table registration logs from indexer records.
- f99e88987: Bump viem to 1.14.0 and abitype to 0.9.8
- 4e445a1ab: Moved boolean array types to use array column types (instead of JSON columns) for the Postgres decoded indexer
- 669fa43e5: Moved numerical array types to use array column types (instead of JSON columns) for the Postgres decoded indexer
- 582388ba5: Add `startBlock` option to `syncToRecs`.

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import worlds from "contracts/worlds.json";

  syncToRecs({
    startBlock: worlds['31337'].blockNumber,
    ...
  });
  ```

- 6573e38e9: Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
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

- 6e66c5b74: Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
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

- a735e14b4: Improved `syncToZustand` speed of hydrating from snapshot by only applying block logs once per block instead of once per log.
- 3e024fcf3: add retry attempts and more logging to `waitForTransaction`
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 7e6e5157b: Catch errors when parsing logs to tables and storage operations, log and skip
- b8a6158d6: bump viem to 1.6.0
- 5d737cf2e: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 22ee44700: All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.
- 1327ea8c8: Fixed `syncToZustand` types so that non-existent tables give an error and `never` type instead of a generic `Table` type.
- 3f5d33af: Fixes an issue with Zustand store sync where multiple updates to a record for a key in the same block did not get tracked and applied properly.
- bfcb293d1: What used to be known as `ephemeral` table is now called `offchain` table.
  The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

  Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
  Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

  ```diff
  - EphemeralTable.emitEphemeral(value);
  + OffchainTable.set(value);
  ```

- 1890f1a06: Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).
- 5294a7d59: Improves support for internal/client-only RECS components
- b8a6158d6: remove usages of `isNonPendingBlock` and `isNonPendingLog` (fixed with more specific viem types)
- 535229984: - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- af639a264: `Store` events have been renamed for consistency and readability.
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

- 34203e4ed: Fixed invalid value when decoding records in `postgres-decoded` storage adapter
- 6c6733256: Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.
- cea754dde: - The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
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

- d2f8e9400: Moved to new resource ID utils.
- Updated dependencies [7ce82b6fc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [77dce993a]
- Updated dependencies [ce97426c0]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [c963b46c7]
- Updated dependencies [05b3e8882]
- Updated dependencies [0f27afddb]
- Updated dependencies [748f4588a]
- Updated dependencies [865253dba]
- Updated dependencies [8f49c277d]
- Updated dependencies [7fa2ca183]
- Updated dependencies [ce7125a1b]
- Updated dependencies [745485cda]
- Updated dependencies [16b13ea8f]
- Updated dependencies [aea67c580]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [c14f8bf1e]
- Updated dependencies [c07fa0215]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [6ca1874e0]
- Updated dependencies [331dbfdcb]
- Updated dependencies [d5c0682fb]
- Updated dependencies [1d60930d6]
- Updated dependencies [01e46d99]
- Updated dependencies [430e6b29a]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [2c920de7]
- Updated dependencies [b98e51808]
- Updated dependencies [b9e562d8f]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [3fb9ce283]
- Updated dependencies [c207d35e8]
- Updated dependencies [db7798be2]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [3be4deecf]
- Updated dependencies [a25881160]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [5debcca8]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [f8dab7334]
- Updated dependencies [1a0fa7974]
- Updated dependencies [f62c767e7]
- Updated dependencies [d00c4a9af]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [c32a9269a]
- Updated dependencies [eb384bb0e]
- Updated dependencies [37c228c63]
- Updated dependencies [618dd0e89]
- Updated dependencies [aacffcb59]
- Updated dependencies [c991c71a]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [e5d208e40]
- Updated dependencies [b38c096d]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [4bb7e8cbf]
- Updated dependencies [1f80a0b52]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [e5a962bc3]
- Updated dependencies [331f0d636]
- Updated dependencies [f6f402896]
- Updated dependencies [d5b73b126]
- Updated dependencies [e34d1170]
- Updated dependencies [08b422171]
- Updated dependencies [b8a6158d6]
- Updated dependencies [190fdd11]
- Updated dependencies [37c228c63]
- Updated dependencies [37c228c63]
- Updated dependencies [433078c54]
- Updated dependencies [db314a74]
- Updated dependencies [b2d2aa715]
- Updated dependencies [4c7fd3eb2]
- Updated dependencies [a0341daf9]
- Updated dependencies [ca50fef81]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [6573e38e9]
- Updated dependencies [51914d656]
- Updated dependencies [eeb15cc06]
- Updated dependencies [063daf80e]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [59267655]
- Updated dependencies [37c228c63]
- Updated dependencies [72b806979]
- Updated dependencies [2bfee9217]
- Updated dependencies [1ca35e9a1]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [88b1a5a19]
- Updated dependencies [1e2ad78e2]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [f8a01a047]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [2ca75f9b9]
- Updated dependencies [f62c767e7]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [1a82c278]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [f1cd43bf9]
- Updated dependencies [9d0f492a9]
- Updated dependencies [55a05fd7a]
- Updated dependencies [f03531d97]
- Updated dependencies [c583f3cd0]
- Updated dependencies [31ffc9d5d]
- Updated dependencies [5e723b90e]
- Updated dependencies [63831a264]
- Updated dependencies [b8a6158d6]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
- Updated dependencies [a7b30c79b]
- Updated dependencies [6470fe1fd]
- Updated dependencies [86766ce1]
- Updated dependencies [92de59982]
- Updated dependencies [5741d53d0]
- Updated dependencies [aee8020a6]
- Updated dependencies [22ee44700]
- Updated dependencies [e2d089c6d]
- Updated dependencies [ad4ac4459]
- Updated dependencies [b8a6158d6]
- Updated dependencies [be313068b]
- Updated dependencies [ac508bf18]
- Updated dependencies [9ff4dd955]
- Updated dependencies [93390d89]
- Updated dependencies [57d8965df]
- Updated dependencies [18d3aea55]
- Updated dependencies [7987c94d6]
- Updated dependencies [bb91edaa0]
- Updated dependencies [144c0d8d]
- Updated dependencies [5ac4c97f4]
- Updated dependencies [bfcb293d1]
- Updated dependencies [3e057061d]
- Updated dependencies [1890f1a06]
- Updated dependencies [e48171741]
- Updated dependencies [e4a6189df]
- Updated dependencies [9b43029c3]
- Updated dependencies [37c228c63]
- Updated dependencies [55ab88a60]
- Updated dependencies [c58da9ad]
- Updated dependencies [37c228c63]
- Updated dependencies [4e4a34150]
- Updated dependencies [535229984]
- Updated dependencies [af639a264]
- Updated dependencies [5e723b90e]
- Updated dependencies [99ab9cd6f]
- Updated dependencies [be18b75b]
- Updated dependencies [0c4f9fea9]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [17f987209]
- Updated dependencies [25086be5f]
- Updated dependencies [37c228c63]
- Updated dependencies [b1d41727d]
- Updated dependencies [3ac68ade6]
- Updated dependencies [c642ff3a0]
- Updated dependencies [22ba7b675]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [3042f86e]
- Updated dependencies [c049c23f4]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [251170e1e]
- Updated dependencies [8025c3505]
- Updated dependencies [c4f49240d]
- Updated dependencies [745485cda]
- Updated dependencies [95f64c85]
- Updated dependencies [afdba793f]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [a2f41ade9]
- Updated dependencies [29c3f5087]
- Updated dependencies [cea754dde]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [331f0d636]
- Updated dependencies [95c59b203]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/world@2.0.0
  - @latticexyz/common@2.0.0
  - @latticexyz/recs@2.0.0
  - @latticexyz/protocol-parser@2.0.0
  - @latticexyz/schema-type@2.0.0
  - @latticexyz/block-logs-stream@2.0.0
  - @latticexyz/config@2.0.0
  - @latticexyz/query@2.0.0

## 2.0.0-next.18

### Major Changes

- 8193136a9: Added `dynamicFieldIndex` to the `Store_SpliceDynamicData` event. This enables indexers to store dynamic data as a blob per dynamic field without a schema lookup.
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

- 252a1852: Migrated to new config format.

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

- d5c0682fb: Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.
- 3f5d33af: Fixes an issue with Zustand store sync where multiple updates to a record for a key in the same block did not get tracked and applied properly.
- Updated dependencies [c9ee5e4a]
- Updated dependencies [8f49c277d]
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [3be4deecf]
- Updated dependencies [5debcca8]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [c991c71a]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [190fdd11]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [1a82c278]
- Updated dependencies [8193136a9]
- Updated dependencies [86766ce1]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [c58da9ad]
- Updated dependencies [be18b75b]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [95f64c85]
- Updated dependencies [3e7d83d0]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/world@2.0.0-next.18
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/protocol-parser@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18
  - @latticexyz/block-logs-stream@2.0.0-next.18
  - @latticexyz/config@2.0.0-next.18
  - @latticexyz/query@2.0.0-next.18
  - @latticexyz/recs@2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- 997286ba: `createStoreSync` now [waits for idle](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) between each chunk of logs in a block to allow for downstream render cycles to trigger. This means that hydrating logs from an indexer will no longer block until hydration completes, but rather allow for `onProgress` callbacks to trigger.

### Patch Changes

- 6c615b60: Bumped the Postgres column size for `int32`, `uint32`, `int64`, and `uint64` types to avoid overflows
- 4e445a1a: Moved boolean array types to use array column types (instead of JSON columns) for the Postgres decoded indexer
- 669fa43e: Moved numerical array types to use array column types (instead of JSON columns) for the Postgres decoded indexer
- Updated dependencies [a35c05ea]
- Updated dependencies [05b3e888]
- Updated dependencies [745485cd]
- Updated dependencies [aabd3076]
- Updated dependencies [db7798be]
- Updated dependencies [618dd0e8]
- Updated dependencies [c162ad5a]
- Updated dependencies [55a05fd7]
- Updated dependencies [6470fe1f]
- Updated dependencies [e2d089c6]
- Updated dependencies [17f98720]
- Updated dependencies [5c52bee0]
- Updated dependencies [745485cd]
  - @latticexyz/common@2.0.0-next.17
  - @latticexyz/store@2.0.0-next.17
  - @latticexyz/world@2.0.0-next.17
  - @latticexyz/schema-type@2.0.0-next.17
  - @latticexyz/block-logs-stream@2.0.0-next.17
  - @latticexyz/protocol-parser@2.0.0-next.17
  - @latticexyz/recs@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- a735e14b: Improved `syncToZustand` speed of hydrating from snapshot by only applying block logs once per block instead of once per log.
- Updated dependencies [c6c13f2e]
- Updated dependencies [0f27afdd]
- Updated dependencies [865253db]
- Updated dependencies [e6c03a87]
- Updated dependencies [c207d35e]
- Updated dependencies [d00c4a9a]
- Updated dependencies [37c228c6]
- Updated dependencies [1bf2e908]
- Updated dependencies [f6f40289]
- Updated dependencies [08b42217]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [063daf80]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [2bfee921]
- Updated dependencies [7b28d32e]
- Updated dependencies [9f8b84e7]
- Updated dependencies [aee8020a]
- Updated dependencies [ad4ac445]
- Updated dependencies [57d8965d]
- Updated dependencies [e4a6189d]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [3ac68ade]
- Updated dependencies [c642ff3a]
- Updated dependencies [37c228c6]
- Updated dependencies [103f635e]
  - @latticexyz/store@2.0.0-next.16
  - @latticexyz/world@2.0.0-next.16
  - @latticexyz/block-logs-stream@2.0.0-next.16
  - @latticexyz/common@2.0.0-next.16
  - @latticexyz/protocol-parser@2.0.0-next.16
  - @latticexyz/recs@2.0.0-next.16
  - @latticexyz/schema-type@2.0.0-next.16

## 2.0.0-next.15

### Major Changes

- 504e25dc: `lastUpdatedBlockNumber` columns in Postgres storage adapters are no longer nullable
- e48fb3b0: Renamed singleton `chain` table to `config` table for clarity.
- 85b94614: The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.
- a4aff73c: Previously, all `store-sync` strategies were susceptible to a potential memory leak where the stream that fetches logs from the RPC would get ahead of the stream that stores the logs in the provided storage adapter. We saw this most often when syncing to remote Postgres servers, where inserting records was much slower than we retrieving them from the RPC. In these cases, the stream would build up a backlog of items until the machine ran out of memory.

  This is now fixed by waiting for logs to be stored before fetching the next batch of logs from the RPC. To make this strategy work, we no longer return `blockLogs# @latticexyz/store-sync (stream of logs fetched from RPC but before they're stored) and instead just return `storedBlockLogs# @latticexyz/store-sync (stream of logs fetched from RPC after they're stored).

- 1b5eb0d0: `syncToPostgres` from `@latticexyz/store-sync/postgres` now uses a single table to store all records in their bytes form (`staticData`, `encodedLengths`, and `dynamicData`), more closely mirroring onchain state and enabling more scalability and stability for automatic indexing of many worlds.

  The previous behavior, where schemaful SQL tables are created and populated for each MUD table, has been moved to a separate `@latticexyz/store-sync/postgres-decoded` export bundle. This approach is considered less stable and is intended to be used for analytics purposes rather than hydrating clients. Some previous metadata columns on these tables have been removed in favor of the bytes records table as the source of truth for onchain state.

  This overhaul is considered breaking and we recommend starting a fresh database when syncing with either of these strategies.

- 7b73f44d: Postgres storage adapter now uses snake case for decoded table names and column names. This allows for better SQL ergonomics when querying these tables.

  To avoid naming conflicts for now, schemas are still case-sensitive and need to be queried with double quotes. We may change this in the future with [namespace validation](https://github.com/latticexyz/mud/issues/1991).

### Minor Changes

- 5df1f31b: Refactored how we fetch snapshots from an indexer, preferring the new `getLogs` endpoint and falling back to the previous `findAll` if it isn't available. This refactor also prepares for an easier entry point for adding client caching of snapshots.

  The `initialState` option for various sync methods (`syncToPostgres`, `syncToRecs`, etc.) is now deprecated in favor of `initialBlockLogs`. For now, we'll automatically convert `initialState` into `initialBlockLogs`, but if you want to update your code, you can do:

  ```ts
  import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";

  const initialBlockLogs = {
    blockNumber: initialState.blockNumber,
    logs: tablesWithRecordsToLogs(initialState.tables),
  };
  ```

- 7eabd06f: Added and populated `syncProgress` key in Zustand store for sync progress, like we do for RECS sync. This will let apps using `syncToZustand` render a loading state while initial client hydration is in progress.

  ```tsx
  const syncProgress = useStore((state) => state.syncProgress);

  if (syncProgress.step !== SyncStep.LIVE) {
    return <>Loading ({Math.floor(syncProgress.percentage)}%)</>;
  }
  ```

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

### Patch Changes

- 0a3b9b1c: Added explicit error logs for unexpected situations.
  Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
  Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.
- 712866f5: `createStoreSync` now correctly creates table registration logs from indexer records.
- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 5d737cf2: Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.
- 34203e4e: Fixed invalid value when decoding records in `postgres-decoded` storage adapter
- Updated dependencies [d8c8f66b]
- Updated dependencies [1b86eac0]
- Updated dependencies [1077c7f5]
- Updated dependencies [933b54b5]
- Updated dependencies [f8dab733]
- Updated dependencies [1a0fa797]
- Updated dependencies [eb384bb0]
- Updated dependencies [e5a962bc]
- Updated dependencies [59054203]
- Updated dependencies [1b5eb0d0]
- Updated dependencies [6db95ce1]
- Updated dependencies [5d737cf2]
- Updated dependencies [5ac4c97f]
- Updated dependencies [e4817174]
- Updated dependencies [4c1dcd81]
- Updated dependencies [5df1f31b]
  - @latticexyz/store@2.0.0-next.15
  - @latticexyz/world@2.0.0-next.15
  - @latticexyz/common@2.0.0-next.15
  - @latticexyz/block-logs-stream@2.0.0-next.15
  - @latticexyz/protocol-parser@2.0.0-next.15
  - @latticexyz/recs@2.0.0-next.15
  - @latticexyz/schema-type@2.0.0-next.15

## 2.0.0-next.14

### Major Changes

- 1faf7f69: `syncToZustand` now uses `tables` argument to populate the Zustand store's `tables` key, rather than the on-chain table registration events. This means we'll no longer store data into Zustand you haven't opted into receiving (e.g. other namespaces).

### Patch Changes

- 1327ea8c: Fixed `syncToZustand` types so that non-existent tables give an error and `never` type instead of a generic `Table` type.
- Updated dependencies [aacffcb5]
- Updated dependencies [b2d2aa71]
- Updated dependencies [bb91edaa]
- Updated dependencies [bb91edaa]
  - @latticexyz/common@2.0.0-next.14
  - @latticexyz/store@2.0.0-next.14
  - @latticexyz/world@2.0.0-next.14
  - @latticexyz/schema-type@2.0.0-next.14
  - @latticexyz/block-logs-stream@2.0.0-next.14
  - @latticexyz/protocol-parser@2.0.0-next.14
  - @latticexyz/recs@2.0.0-next.14

## 2.0.0-next.13

### Minor Changes

- de47d698: Added an optional `tables` option to `syncToRecs` to allow you to sync from tables that may not be expressed by your MUD config. This will be useful for namespaced tables used by [ERC20](https://github.com/latticexyz/mud/pull/1789) and [ERC721](https://github.com/latticexyz/mud/pull/1844) token modules until the MUD config gains [namespace support](https://github.com/latticexyz/mud/issues/994).

  Here's how we use this in our example project with the `KeysWithValue` module:

  ```ts
  syncToRecs({
    ...
    tables: {
      KeysWithValue: {
        namespace: "keywval",
        name: "Inventory",
        tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
        keySchema: {
          valueHash: { type: "bytes32" },
        },
        valueSchema: {
          keysWithValue: { type: "bytes32[]" },
        },
      },
    },
    ...
  });
  ```

- f6d214e3: Added a `filters` option to store sync to allow filtering client data on tables and keys. Previously, it was only possible to filter on `tableIds`, but the new filter option allows for more flexible filtering by key.

  If you are building a large MUD application, you can use positional keys as a way to shard data and make it possible to load only the data needed in the client for a particular section of your app. We're using this already in Sky Strife to load match-specific data into match pages without having to load data for all matches, greatly improving load time and client performance.

  ```ts
  syncToRecs({
    ...
    filters: [{ tableId: '0x...', key0: '0x...' }],
  });
  ```

  The `tableIds` option is now deprecated and will be removed in the future, but is kept here for backwards compatibility.

- fa776358: Added a Zustand storage adapter and corresponding `syncToZustand` method for use in vanilla and React apps. It's used much like the other sync methods, except it returns a bound store and set of typed tables.

  ```ts
  import { syncToZustand } from "@latticexyz/store-sync/zustand";
  import config from "contracts/mud.config";

  const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
    config,
    ...
  });

  // in vanilla apps
  const positions = useStore.getState().getRecords(tables.Position);

  // in React apps
  const positions = useStore((state) => state.getRecords(tables.Position));
  ```

  This change will be shortly followed by an update to our templates that uses Zustand as the default client data store and sync method.

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/recs@2.0.0-next.13
  - @latticexyz/block-logs-stream@2.0.0-next.13
  - @latticexyz/protocol-parser@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13
  - @latticexyz/world@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- d2f8e940: Moved to new resource ID utils.
- Updated dependencies [7ce82b6f]
- Updated dependencies [7fa2ca18]
- Updated dependencies [6ca1874e]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [29c3f508]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/world@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/block-logs-stream@2.0.0-next.12
  - @latticexyz/protocol-parser@2.0.0-next.12
  - @latticexyz/recs@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- 08d7c471: Export postgres column type helpers from `@latticexyz/store-sync`.
- f99e8898: Bump viem to 1.14.0 and abitype to 0.9.8
- Updated dependencies [16b13ea8]
- Updated dependencies [430e6b29]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
- Updated dependencies [a2f41ade]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/world@2.0.0-next.11
  - @latticexyz/block-logs-stream@2.0.0-next.11
  - @latticexyz/protocol-parser@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/recs@2.0.0-next.11

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

- Updated dependencies [[`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29), [`7987c94d`](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)]:
  - @latticexyz/world@2.0.0-next.10
  - @latticexyz/block-logs-stream@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/protocol-parser@2.0.0-next.10
  - @latticexyz/recs@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10

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

  As such, we've replaced `blockStorageOperations# @latticexyz/store-sync with `storedBlockLogs# @latticexyz/store-sync, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

### Patch Changes

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

- [#1488](https://github.com/latticexyz/mud/pull/1488) [`7e6e5157`](https://github.com/latticexyz/mud/commit/7e6e5157bb124f19bd8ed9f02b93afadc97cdf50) Thanks [@holic](https://github.com/holic)! - Catch errors when parsing logs to tables and storage operations, log and skip

- [#1586](https://github.com/latticexyz/mud/pull/1586) [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612) Thanks [@alvrs](https://github.com/alvrs)! - All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.

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

- Updated dependencies [[`77dce993`](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a), [`748f4588`](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033), [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`1f80a0b5`](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`4c7fd3eb`](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651), [`a0341daf`](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`f8a01a04`](https://github.com/latticexyz/mud/commit/f8a01a047d73a15326ebf6577ea033674d8e61a9), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`f1cd43bf`](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203), [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`5741d53d`](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`9ff4dd95`](https://github.com/latticexyz/mud/commit/9ff4dd955fd6dca36eb15cfe7e46bb522d2e943b), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b), [`95c59b20`](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)]:
  - @latticexyz/world@2.0.0-next.9
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/protocol-parser@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/block-logs-stream@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/recs@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies [[`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7), [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac), [`51914d65`](https://github.com/latticexyz/mud/commit/51914d656d8cd8d851ccc8296d249cf09f53e670), [`2ca75f9b`](https://github.com/latticexyz/mud/commit/2ca75f9b9063ea33524e6c609b87f5494f678fa0), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)]:
  - @latticexyz/store@2.0.0-next.8
  - @latticexyz/world@2.0.0-next.8
  - @latticexyz/protocol-parser@2.0.0-next.8
  - @latticexyz/block-logs-stream@2.0.0-next.8
  - @latticexyz/common@2.0.0-next.8
  - @latticexyz/recs@2.0.0-next.8
  - @latticexyz/schema-type@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies [[`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15), [`18d3aea5`](https://github.com/latticexyz/mud/commit/18d3aea55b1d7f4b442c21343795c299a56fc481)]:
  - @latticexyz/store@2.0.0-next.7
  - @latticexyz/world@2.0.0-next.7
  - @latticexyz/block-logs-stream@2.0.0-next.7
  - @latticexyz/common@2.0.0-next.7
  - @latticexyz/protocol-parser@2.0.0-next.7
  - @latticexyz/recs@2.0.0-next.7
  - @latticexyz/schema-type@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies [[`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)]:
  - @latticexyz/store@2.0.0-next.6
  - @latticexyz/world@2.0.0-next.6
  - @latticexyz/schema-type@2.0.0-next.6
  - @latticexyz/block-logs-stream@2.0.0-next.6
  - @latticexyz/common@2.0.0-next.6
  - @latticexyz/protocol-parser@2.0.0-next.6
  - @latticexyz/recs@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies [[`ce97426c`](https://github.com/latticexyz/mud/commit/ce97426c0d70832e5efdb8bad83207a9d840302b), [`1ca35e9a`](https://github.com/latticexyz/mud/commit/1ca35e9a1630a51dfd1e082c26399f76f2cd06ed), [`9d0f492a`](https://github.com/latticexyz/mud/commit/9d0f492a90e5d94c6b38ad732e78fd4b13b2adbe), [`c583f3cd`](https://github.com/latticexyz/mud/commit/c583f3cd08767575ce9df39725ec51195b5feb5b)]:
  - @latticexyz/world@2.0.0-next.5
  - @latticexyz/block-logs-stream@2.0.0-next.5
  - @latticexyz/common@2.0.0-next.5
  - @latticexyz/protocol-parser@2.0.0-next.5
  - @latticexyz/recs@2.0.0-next.5
  - @latticexyz/schema-type@2.0.0-next.5
  - @latticexyz/store@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- Updated dependencies [[`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64), [`c14f8bf1`](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c)]:
  - @latticexyz/recs@2.0.0-next.4
  - @latticexyz/block-logs-stream@2.0.0-next.4
  - @latticexyz/common@2.0.0-next.4
  - @latticexyz/protocol-parser@2.0.0-next.4
  - @latticexyz/schema-type@2.0.0-next.4
  - @latticexyz/store@2.0.0-next.4
  - @latticexyz/world@2.0.0-next.4

## 2.0.0-next.3

### Major Changes

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

- [#1315](https://github.com/latticexyz/mud/pull/1315) [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e) Thanks [@holic](https://github.com/holic)! - Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

  By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

  If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

  ```ts
  const { blockStorageOperations$ } = syncToRecs({
    ...
    startSync: false,
  });

  // start sync manually by subscribing to `blockStorageOperation# @latticexyz/store-sync
  const subcription = blockStorageOperation$.subscribe();

  // clean up subscription
  subscription.unsubscribe();
  ```

- [#1317](https://github.com/latticexyz/mud/pull/1317) [`3e024fcf`](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1) Thanks [@holic](https://github.com/holic)! - add retry attempts and more logging to `waitForTransaction`

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/world@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/protocol-parser@2.0.0-next.3
  - @latticexyz/block-logs-stream@2.0.0-next.3
  - @latticexyz/recs@2.0.0-next.3
  - @latticexyz/schema-type@2.0.0-next.3

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
