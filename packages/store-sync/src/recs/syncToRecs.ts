import { StoreConfig, storeEventsAbi } from "@latticexyz/store";
import { Address, Chain, PublicClient, Transport } from "viem";
import {
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  World as RecsWorld,
  createWorld,
} from "@latticexyz/recs";
import { KeySchema, ValueSchema } from "../common";
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

type SyncToRecsOptions = {
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
};

type SyncToRecsResult = {
  // TODO: return publicClient?
  // TODO: return components, if we extend them
  world: RecsWorld;
  singletonEntity: Entity;
  destroy: () => void;
};

export function syncToRecs({ config, address, publicClient, components }: SyncToRecsOptions): SyncToRecsResult {
  const world = createWorld();

  // TODO: fetch start block from indexer and/or deploy event
  const startBlock = 0n;
  const latestBlock$ = createBlockStream({ publicClient, blockTag: "latest" });

  const latestBlockNumber$ = latestBlock$.pipe(
    filter(isNonPendingBlock),
    map((block) => block.number)
  );

  const blockLogs$ = latestBlockNumber$.pipe(
    tap((latestBlockNumber) => console.log("latest block number", latestBlockNumber)),
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
        console.log("stored", operations.length, "operations for block", blockNumber);
      })
    )
    .subscribe();

  const singletonEntity = world.registerEntity({ id: hexKeyTupleToEntity([]) });

  return {
    world,
    singletonEntity,
    destroy: (): void => {
      world.dispose();
      subscription.unsubscribe();
    },
  };
}
