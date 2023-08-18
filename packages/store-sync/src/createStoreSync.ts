import {
  ConfigToKeyPrimitives,
  ConfigToValuePrimitives,
  StoreConfig,
  TableRecord,
  storeEventsAbi,
} from "@latticexyz/store";
import { Hex, TransactionReceipt } from "viem";
import { SetRecordOperation, SyncOptions, SyncResult, Table, TableWithRecords } from "./common";
import { createBlockStream, blockRangeToLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import {
  filter,
  map,
  tap,
  mergeMap,
  from,
  concat,
  concatMap,
  share,
  firstValueFrom,
  defer,
  of,
  catchError,
  shareReplay,
  switchMap,
} from "rxjs";
import { blockLogsToStorage } from "./blockLogsToStorage";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { BlockLogsToStorageOptions } from "./blockLogsToStorage";
import { SyncStep } from "./SyncStep";
import { isDefined } from "@latticexyz/common/utils";

const debug = parentDebug.extend("createStoreSync");

type CreateStoreSyncOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  storageAdapter: BlockLogsToStorageOptions<TConfig>;
  onProgress?: (opts: {
    step: SyncStep;
    percentage: number;
    latestBlockNumber: bigint;
    lastBlockNumberProcessed: bigint;
    message: string;
  }) => void;
};

type CreateStoreSyncResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig>;

export async function createStoreSync<TConfig extends StoreConfig = StoreConfig>({
  storageAdapter,
  onProgress,
  address,
  publicClient,
  startBlock: initialStartBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: CreateStoreSyncOptions<TConfig>): Promise<CreateStoreSyncResult<TConfig>> {
  // TODO: refactor as a stream of block storage operations to prepend to blockStorageOperations$
  const initialState$ =
    indexerUrl != null && initialState == null
      ? defer(
          async (): Promise<{
            blockNumber: bigint | null;
            tables: TableWithRecords[];
          }> => {
            debug("fetching initial state from indexer", indexerUrl);

            onProgress?.({
              step: SyncStep.SNAPSHOT,
              percentage: 0,
              latestBlockNumber: 0n,
              lastBlockNumberProcessed: 0n,
              message: "Fetching snapshot from indexer",
            });

            const indexer = createIndexerClient({ url: indexerUrl });
            const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
            const result = await indexer.findAll.query({ chainId, address });

            onProgress?.({
              step: SyncStep.SNAPSHOT,
              percentage: 100,
              latestBlockNumber: 0n,
              lastBlockNumberProcessed: 0n,
              message: "Fetching snapshot from indexer",
            });

            return result;
          }
        ).pipe(
          catchError((error) => {
            debug("error fetching initial state from indexer", error);

            onProgress?.({
              step: SyncStep.SNAPSHOT,
              percentage: 100,
              latestBlockNumber: 0n,
              lastBlockNumberProcessed: initialStartBlock,
              message: "Failed to fetch snapshot from indexer",
            });

            return of(initialState);
          })
        )
      : of(initialState);

  const startBlock$ = initialState$.pipe(
    map((initialState) => initialState?.blockNumber ?? initialStartBlock),
    shareReplay(1)
  );
  // TODO: figure out if we need startBlock$ to shareReplay(1)
  // TODO: if start block is still 0, find via deploy event

  const initialStorageOperations$ = initialState$.pipe(
    filter(
      (initialState): initialState is { blockNumber: bigint; tables: TableWithRecords[] } =>
        initialState != null && initialState.blockNumber != null && initialState.tables.length > 0
    ),
    map(({ blockNumber, tables }) => ({
      blockNumber,
      operations: tables.flatMap((table) =>
        table.records.map(
          (record) =>
            ({
              type: "SetRecord",
              address: table.address,
              namespace: table.namespace,
              name: table.name,
              key: record.key as ConfigToKeyPrimitives<TConfig, typeof table.name>,
              value: record.value as ConfigToValuePrimitives<TConfig, typeof table.name>,
            } as const satisfies SetRecordOperation<TConfig>)
        )
      ),
    })),
    shareReplay(1)
  );

  // const startBlock$ = initialState$.pipe(
  //   concatMap(async (initialState) => {
  //     const { blockNumber, tables } = initialState ?? { blockNumber: null, tables: [] };
  //     if (blockNumber == null || tables.length === 0) return initialStartBlock;

  //     debug("hydrating from initial state to block", blockNumber);

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 0,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: blockNumber,
  //       message: "Hydrating from snapshot",
  //     });

  //     await storageAdapter.registerTables({ blockNumber, tables });

  //     // TODO: split into chunks at storage adapter level, expose some onProgress callback?
  //     await storageAdapter.storeOperations({
  //       blockNumber,
  //       operations: tables.flatMap((table) =>
  //         table.records.map(
  //           (record) =>
  //             ({
  //               type: "SetRecord",
  //               address: table.address,
  //               namespace: table.namespace,
  //               name: table.name,
  //               key: record.key as ConfigToKeyPrimitives<TConfig, typeof table.name>,
  //               value: record.value as ConfigToValuePrimitives<TConfig, typeof table.name>,
  //             } as const satisfies SetRecordOperation<TConfig>)
  //         )
  //       ),
  //     });

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 100,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: blockNumber,
  //       message: "Hydrating from snapshot",
  //     });

  //     return blockNumber;
  //   }),
  //   catchError((error) => {
  //     debug("error hydrating from initial state", error);

  //     onProgress?.({
  //       step: SyncStep.SNAPSHOT,
  //       percentage: 100,
  //       latestBlockNumber: 0n,
  //       lastBlockNumberProcessed: initialStartBlock,
  //       message: "Failed to hydrate from snapshot",
  //     });

  //     return of(initialStartBlock);
  //   }),
  //   // TODO: if start block is still 0, find via deploy event
  //   shareReplay(1)
  // );

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(shareReplay(1));
  const latestBlockNumber$ = latestBlock$.pipe(
    map((block) => block.number),
    tap((blockNumber) => {
      debug("latest block number", blockNumber);
    }),
    shareReplay(1)
  );

  let startBlock: bigint | null = null;
  let endBlock: bigint | null = null;
  const blockLogs$ = latestBlockNumber$.pipe(
    switchMap((endBlock) => startBlock$.pipe(map((startBlock) => ({ startBlock, endBlock })))),
    tap((range) => {
      debug("starting sync from block", range.startBlock);
      startBlock = range.startBlock;
      endBlock = range.endBlock;
    }),
    blockRangeToLogs({
      publicClient,
      address,
      events: storeEventsAbi,
      maxBlockRange,
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock))),
    share()
  );

  let lastBlockNumberProcessed: bigint | null = null;
  const blockStorageOperations$ = concat(
    initialStorageOperations$,
    blockLogs$.pipe(
      concatMap(blockLogsToStorage(storageAdapter)),
      tap(({ blockNumber, operations }) => {
        debug("stored", operations.length, "operations for block", blockNumber);
        lastBlockNumberProcessed = blockNumber;

        if (startBlock != null && endBlock != null) {
          if (blockNumber < endBlock) {
            const totalBlocks = endBlock - startBlock;
            const processedBlocks = lastBlockNumberProcessed - startBlock;
            onProgress?.({
              step: SyncStep.RPC,
              percentage: Number((processedBlocks * 1000n) / totalBlocks) / 1000,
              latestBlockNumber: endBlock,
              lastBlockNumberProcessed,
              message: "Hydrating from RPC",
            });
          } else {
            onProgress?.({
              step: SyncStep.LIVE,
              percentage: 100,
              latestBlockNumber: endBlock,
              lastBlockNumberProcessed,
              message: "All caught up!",
            });
          }
        }
      })
    )
  ).pipe(share());

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
  }> {
    // Wait for tx to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    // If we haven't processed a block yet or we haven't processed the block for the tx, wait for it
    if (lastBlockNumberProcessed == null || lastBlockNumberProcessed < receipt.blockNumber) {
      await firstValueFrom(
        blockStorageOperations$.pipe(
          filter(({ blockNumber }) => blockNumber != null && blockNumber >= receipt.blockNumber)
        )
      );
    }

    return { receipt };
  }

  return {
    latestBlock$,
    latestBlockNumber$,
    blockLogs$,
    blockStorageOperations$: concat(initialStorageOperations$, blockStorageOperations$),
    waitForTransaction,
  };
}
