import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Address, Chain, Hex, PublicClient, TransactionReceipt, Transport } from "viem";
import {
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  World as RecsWorld,
  setComponent,
} from "@latticexyz/recs";
import { StorageOperation, Table, TableRecord } from "../common";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap, Observable, share, firstValueFrom } from "rxjs";
import { BlockStorageOperations, blockLogsToStorage } from "../blockLogsToStorage";
import { recsStorage } from "./recsStorage";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { debug } from "./debug";
import { encodeKeyTuple } from "@latticexyz/protocol-parser";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableKey } from "./getTableKey";
import { StoreComponentMetadata } from "./common";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = {
  world: RecsWorld;
  config: TConfig;
  address: Address;
  // TODO: make this optional and return one if none provided (but will need chain ID at least)
  publicClient: PublicClient<Transport, Chain>;
  // TODO: generate these from config and return instead?
  components: Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>>;
  initialState?: {
    blockNumber: bigint | null;
    tables: (Table & { records: TableRecord[] })[];
  };
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = {
  // TODO: return publicClient?
  // TODO: return components, if we extend them
  singletonEntity: Entity;
  blockStorageOperations$: Observable<BlockStorageOperations<TConfig>>;
  waitForTransaction: (tx: Hex) => Promise<{
    receipt: TransactionReceipt;
    operations: StorageOperation<TConfig>[];
  }>;
  destroy: () => void;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
  config,
  address,
  publicClient,
  components: initialComponents,
  initialState,
}: SyncToRecsOptions<TConfig>): Promise<SyncToRecsResult<TConfig>> {
  const components = {
    ...initialComponents,
    ...defineInternalComponents(world),
  };

  const singletonEntity = world.registerEntity({ id: hexKeyTupleToEntity([]) });

  let startBlock = 0n;

  if (initialState != null && initialState.blockNumber != null) {
    debug("hydrating from initial state to block", initialState.blockNumber);
    startBlock = initialState.blockNumber + 1n;

    const componentList = Object.values(components);

    for (const table of initialState.tables) {
      setComponent(components.TableMetadata, getTableKey(table) as Entity, { table });
      const component = componentList.find((component) => component.id === table.tableId);
      if (component == null) {
        debug(`no component found for table ${table.namespace}:${table.name}, skipping initial state`);
        continue;
      }
      for (const record of table.records) {
        // TODO: rework encodeKeyTuple to take a schema tuple or KeySchema
        const entity = hexKeyTupleToEntity(
          encodeKeyTuple({ staticFields: Object.values(table.keySchema), dynamicFields: [] }, Object.values(record.key))
        );
        setComponent(component, entity, record.value as ComponentValue);
      }
      debug(`hydrated ${table.records.length} records for table ${table.namespace}:${table.name}`);
    }
  }

  // TODO: if startBlock is still 0, find via deploy event

  debug("starting sync from block", startBlock);

  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  const blockLogs$ = latestBlockNumber$.pipe(
    tap((latestBlockNumber) => debug("latest block number", latestBlockNumber)),
    map((latestBlockNumber) => ({ startBlock, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: storeEventsAbi,
    }),
    mergeMap(({ toBlock, logs }) => from(groupLogsByBlockNumber(logs, toBlock)))
  );

  const blockStorageOperations$ = blockLogs$.pipe(
    concatMap(blockLogsToStorage(recsStorage({ components, config }))),
    tap(({ blockNumber, operations }) => {
      debug("stored", operations.length, "operations for block", blockNumber);
    }),
    share()
  );

  async function waitForTransaction(tx: Hex): Promise<{
    receipt: TransactionReceipt;
    operations: StorageOperation<TConfig>[];
  }> {
    // Wait for tx to be mined, then find the resulting block storage operations.
    // We could just do this based on the blockStorageOperations$, but for txs that have no storage operations, we'd never get a value.
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    const operationsForTx$ = blockStorageOperations$.pipe(
      filter(({ blockNumber }) => blockNumber === receipt.blockNumber),
      map(({ operations }) => operations.filter((op) => op.log.transactionHash === tx))
    );
    return {
      receipt,
      operations: await firstValueFrom(operationsForTx$),
    };
  }

  const subscription = blockStorageOperations$.subscribe();

  return {
    singletonEntity,
    blockStorageOperations$,
    waitForTransaction,
    destroy: (): void => {
      world.dispose();
      subscription.unsubscribe();
    },
  };
}
