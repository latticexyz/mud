import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Address, Chain, PublicClient, Transport } from "viem";
import {
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  World as RecsWorld,
  setComponent,
} from "@latticexyz/recs";
import { KeySchema, ValueSchema, Table, TableRecord } from "../common";
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-logs-stream";
import { filter, map, tap, mergeMap, from, concatMap } from "rxjs";
import { blockLogsToStorage } from "../blockLogsToStorage";
import { recsStorage } from "./recsStorage";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { debug } from "./debug";
import { encodeKeyTuple } from "@latticexyz/protocol-parser";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableKey } from "./getTableKey";

type SyncToRecsOptions = {
  world: RecsWorld;
  config: StoreConfig;
  address: Address;
  // TODO: make this optional and return one if none provided (but will need chain ID at least)
  publicClient: PublicClient<Transport, Chain>;
  // TODO: generate these from config and return instead?
  components: Record<
    string,
    RecsComponent<
      RecsSchema,
      {
        contractId: string;
        keySchema: KeySchema;
        valueSchema: ValueSchema;
      }
    >
  >;
  initialState?: {
    blockNumber: bigint | null;
    tables: (Table & { records: TableRecord[] })[];
  };
};

type SyncToRecsResult = {
  // TODO: return publicClient?
  // TODO: return components, if we extend them
  singletonEntity: Entity;
  destroy: () => void;
};

export async function syncToRecs({
  world,
  config,
  address,
  publicClient,
  components: initialComponents,
  initialState,
}: SyncToRecsOptions): Promise<SyncToRecsResult> {
  const components = {
    ...initialComponents,
    ...defineInternalComponents(world),
  };

  let startBlock = 0n;

  if (initialState != null && initialState.blockNumber != null) {
    debug("hydrating from initial state to block", initialState.blockNumber);
    startBlock = initialState.blockNumber + 1n;

    const componentList = Object.values(components);

    for (const table of initialState.tables) {
      setComponent(components.TableMetadata, getTableKey(table) as Entity, { table });
      const component = componentList.find((component) => component.metadata.contractId === table.tableId);
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

  const subscription = blockLogs$
    .pipe(
      concatMap(blockLogsToStorage(recsStorage({ components, config }))),
      tap(({ blockNumber, operations }) => {
        debug("stored", operations.length, "operations for block", blockNumber);
      })
    )
    .subscribe();

  const singletonEntity = world.registerEntity({ id: hexKeyTupleToEntity([]) });

  return {
    singletonEntity,
    destroy: (): void => {
      world.dispose();
      subscription.unsubscribe();
    },
  };
}
