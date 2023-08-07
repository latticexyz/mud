import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Address, Block, Chain, Hex, PublicClient, TransactionReceipt, Transport } from "viem";
import {
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  World as RecsWorld,
  getComponentValue,
  setComponent,
} from "@latticexyz/recs";
import { BlockLogs, Table } from "../common";
import { TableRecord } from "@latticexyz/store";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap, Observable, share, firstValueFrom } from "rxjs";
import { BlockStorageOperations, blockLogsToStorage } from "../blockLogsToStorage";
import { recsStorage } from "./recsStorage";
import { debug } from "./debug";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableKey } from "./getTableKey";
import { StoreComponentMetadata, SyncStep } from "./common";
import { encodeEntity } from "./encodeEntity";
import { createIndexerClient } from "../trpc-indexer";
import { singletonEntity } from "./singletonEntity";

type SyncToRecsOptions<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
> = {
  world: RecsWorld;
  config: TConfig;
  address: Address;
  // TODO: make this optional and return one if none provided (but will need chain ID at least)
  publicClient: PublicClient;
  // TODO: generate these from config and return instead?
  components: TComponents;
  startBlock?: bigint;
  indexerUrl?: string;
  initialState?: {
    blockNumber: bigint | null;
    tables: (Table & { records: TableRecord[] })[];
  };
};

type SyncToRecsResult<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
> = {
  // TODO: return publicClient?
  components: TComponents & ReturnType<typeof defineInternalComponents>;
  latestBlock$: Observable<Block>;
  latestBlockNumber$: Observable<bigint>;
  blockLogs$: Observable<BlockLogs>;
  blockStorageOperations$: Observable<BlockStorageOperations<TConfig>>;
  waitForTransaction: (tx: Hex) => Promise<{ receipt: TransactionReceipt }>;
  destroy: () => void;
};

export async function syncToRecs<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
>({
  world,
  config,
  address,
  publicClient,
  components: initialComponents,
  startBlock = 0n,
  initialState,
  indexerUrl,
}: SyncToRecsOptions<TConfig, TComponents>): Promise<SyncToRecsResult<TConfig, TComponents>> {
  const components = {
    ...initialComponents,
    ...defineInternalComponents(world),
  };

  world.registerEntity({ id: singletonEntity });

  if (indexerUrl != null && initialState == null) {
    try {
      const indexer = createIndexerClient({ url: indexerUrl });
      const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
      initialState = await indexer.findAll.query({ chainId, address });
    } catch (error) {
      debug("couldn't get initial state from indexer", error);
      // additionally log to console for Playwright
      // TODO: figure out why Playwright and debug/localStorage don't play nicely together
      console.log("couldn't get initial state from indexer", error);
    }
  }

  if (initialState != null && initialState.blockNumber != null) {
    debug("hydrating from initial state to block", initialState.blockNumber);
    startBlock = initialState.blockNumber + 1n;

    setComponent(components.SyncProgress, singletonEntity, {
      step: SyncStep.SNAPSHOT,
      message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
      percentage: 0,
      latestBlockNumber: 0n,
      lastBlockNumberProcessed: initialState.blockNumber,
    });

    const componentList = Object.values(components);

    const numRecords = initialState.tables.reduce((sum, table) => sum + table.records.length, 0);
    const recordsPerSyncProgressUpdate = Math.floor(numRecords / 100);
    let recordsProcessed = 0;

    for (const table of initialState.tables) {
      setComponent(components.TableMetadata, getTableKey(table) as Entity, { table });
      const component = componentList.find((component) => component.id === table.tableId);
      if (component == null) {
        debug(`no component found for table ${table.namespace}:${table.name}, skipping initial state`);
        continue;
      }
      for (const record of table.records) {
        const entity = encodeEntity(table.keySchema, record.key);
        setComponent(component, entity, record.value as ComponentValue);

        recordsProcessed++;
        if (recordsProcessed % recordsPerSyncProgressUpdate === 0) {
          setComponent(components.SyncProgress, singletonEntity, {
            step: SyncStep.SNAPSHOT,
            message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
            percentage: (recordsProcessed / numRecords) * 100,
            latestBlockNumber: 0n,
            lastBlockNumberProcessed: initialState.blockNumber,
          });
        }
      }
      debug(`hydrated ${table.records.length} records for table ${table.namespace}:${table.name}`);
    }

    setComponent(components.SyncProgress, singletonEntity, {
      step: SyncStep.SNAPSHOT,
      message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
      percentage: (recordsProcessed / numRecords) * 100,
      latestBlockNumber: 0n,
      lastBlockNumberProcessed: initialState.blockNumber,
    });
  }

  // TODO: if startBlock is still 0, find via deploy event

  debug("starting sync from block", startBlock);

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" }).pipe(share());

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number),
    share()
  );

  let latestBlockNumber: bigint | null = null;
  const blockLogs$ = latestBlockNumber$.pipe(
    tap((blockNumber) => {
      debug("latest block number", blockNumber);
      latestBlockNumber = blockNumber;
    }),
    map((blockNumber) => ({ startBlock, endBlock: blockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: storeEventsAbi,
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock))),
    share()
  );

  let lastBlockNumberProcessed: bigint | null = null;
  const blockStorageOperations$ = blockLogs$.pipe(
    concatMap(blockLogsToStorage(recsStorage({ components, config }))),
    tap(({ blockNumber, operations }) => {
      debug("stored", operations.length, "operations for block", blockNumber);
      lastBlockNumberProcessed = blockNumber;

      if (
        latestBlockNumber != null &&
        getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE
      ) {
        if (lastBlockNumberProcessed < latestBlockNumber) {
          setComponent(components.SyncProgress, singletonEntity, {
            step: SyncStep.RPC,
            message: `Hydrating from RPC to block ${latestBlockNumber}`,
            percentage: (Number(lastBlockNumberProcessed) / Number(latestBlockNumber)) * 100,
            latestBlockNumber,
            lastBlockNumberProcessed,
          });
        } else {
          setComponent(components.SyncProgress, singletonEntity, {
            step: SyncStep.LIVE,
            message: `All caught up!`,
            percentage: 100,
            latestBlockNumber,
            lastBlockNumberProcessed,
          });
        }
      }
    }),
    share()
  );

  // Start the sync
  const sub = blockStorageOperations$.subscribe();
  world.registerDisposer(() => sub.unsubscribe());

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
    components,
    latestBlock$,
    latestBlockNumber$,
    blockLogs$,
    blockStorageOperations$,
    waitForTransaction,
    destroy: (): void => {
      world.dispose();
    },
  };
}
