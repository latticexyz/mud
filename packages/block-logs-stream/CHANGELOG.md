# @latticexyz/block-logs-stream

## 2.0.0-next.0

### Minor Changes

- [#1176](https://github.com/latticexyz/mud/pull/1176) [`eeb15cc0`](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234) Thanks [@holic](https://github.com/holic)! - - Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.

  - Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

- [#1070](https://github.com/latticexyz/mud/pull/1070) [`72b80697`](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75) Thanks [@holic](https://github.com/holic)! - Add block logs stream package

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

### Patch Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
  - @latticexyz/config@2.0.0-next.0
