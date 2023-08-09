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
