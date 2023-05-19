import { Observable, concatMap, map, of } from "rxjs";
import { fetchStoreEvents } from "./fetchStoreEvents";
import { NetworkComponentUpdate, NetworkEvent } from "../types";
import orderBy from "lodash/orderBy";
import debug from "debug";
import { awaitPromise, range } from "@latticexyz/utils";

/**
 * Create a RxJS stream of {@link NetworkComponentUpdate}s by listening to new
 * blocks from the blockNumber$ stream and fetching the corresponding block
 * from the connected RPC.
 *
 * @dev Only use if {@link createLatestEventStreamService} is not available.
 *
 * @param blockNumber$ Block number stream
 * @param fetchWorldEvents Function to fetch World events in a block range ({@link createFetchWorldEventsInBlockRange}).
 * @returns Stream of {@link NetworkComponentUpdate}s.
 */
export function createLatestEventStreamRPC(
  blockNumber$: Observable<number>,
  boundFetchStoreEvents: (fromBlock: number, toBlock: number) => ReturnType<typeof fetchStoreEvents>
): Observable<NetworkEvent> {
  let lastSyncedBlockNumber: number | undefined;

  return blockNumber$.pipe(
    map(async (blockNumber) => {
      const from =
        lastSyncedBlockNumber == null || lastSyncedBlockNumber >= blockNumber ? blockNumber : lastSyncedBlockNumber + 1;
      const to = blockNumber;
      lastSyncedBlockNumber = to;
      const storeEvents = await boundFetchStoreEvents(from, to);

      const events = orderBy(storeEvents, ["blockNumber", "logIndex"]);
      debug(`fetched ${events.length} events from block range ${from} -> ${to}`);

      return events;
    }),
    awaitPromise(),
    concatMap((v) => of(...v))
  );
}

/**
 * Fetch ECS events from contracts in the given block range.
 *
 * @param fetchWorldEvents Function to fetch World events in a block range ({@link createFetchWorldEventsInBlockRange}).
 * @param fromBlockNumber Start of block range (inclusive).
 * @param toBlockNumber End of block range (inclusive).
 * @param interval Chunk fetching the blocks in intervals to avoid overwhelming the client.
 * @returns Promise resolving with array containing the contract ECS events in the given block range.
 */
export async function fetchEventsInBlockRangeChunked(
  boundFetchStoreEvents: (fromBlock: number, toBlock: number) => ReturnType<typeof fetchStoreEvents>,
  fromBlockNumber: number,
  toBlockNumber: number,
  interval = 50,
  setPercentage?: (percentage: number) => void
): Promise<NetworkComponentUpdate[]> {
  let events: NetworkComponentUpdate[] = [];
  const delta = toBlockNumber - fromBlockNumber;
  const numSteps = Math.ceil(delta / interval);
  const steps = [...range(numSteps, interval, fromBlockNumber)];

  for (let i = 0; i < steps.length; i++) {
    const from = steps[i];
    const to = i === steps.length - 1 ? toBlockNumber : steps[i + 1] - 1;
    const storeEvents = await boundFetchStoreEvents(from, to);

    if (setPercentage) setPercentage(((i * interval) / delta) * 100);
    debug(`initial sync fetched ${events.length} events from block range ${from} -> ${to}`);

    events = events.concat(orderBy(storeEvents, ["blockNumber", "logIndex"]));
  }

  return events;
}
