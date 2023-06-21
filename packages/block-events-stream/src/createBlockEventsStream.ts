import { BehaviorSubject, Subject, Subscribable } from "rxjs";
import type { BlockNumber, Hex, PublicClient } from "viem";
import type { AbiEvent } from "abitype";
import { BlockEvents, BlockEventsStream } from "./common";
import { bigIntMin } from "./utils";
import { isNonPendingLog } from "./isNonPendingLog";
import { debug } from "./debug";
import { createBlockNumberStream } from "./createBlockNumberStream";

// TODO: add nice logging with debub lib or similar
// TODO: make `toBlock` accept a `BehaviorSubject<BlockNumber>` or add `latestBlockStream` so we only need one listener/watcher/poller
// TODO: consider excluding `pending` block tags so we can just assume all block numbers are present

export type CreateBlockEventsStreamOptions<TAbiEvent extends AbiEvent> = {
  publicClient: PublicClient;
  fromBlock?: BlockNumber;
  toBlock?: BlockNumber | Subscribable<BlockNumber>;
  address?: Hex;
  events: readonly TAbiEvent[];
  maxBlockRange?: number; // defaults to 1000
};

export async function createBlockEventsStream<TAbiEvent extends AbiEvent>({
  publicClient,
  fromBlock: initialFromBlock,
  toBlock: initialToBlock,
  address,
  events,
  maxBlockRange = 1000,
}: CreateBlockEventsStreamOptions<TAbiEvent>): Promise<BlockEventsStream<TAbiEvent>> {
  debug("createBlockEventsStream", { initialFromBlock, initialToBlock, address, events, maxBlockRange });

  if (initialFromBlock == null) {
    debug("getting earliest block");
    const earliestBlock = await publicClient.getBlock({ blockTag: "earliest" });
    debug("earliest block", earliestBlock);
    if (earliestBlock.number == null) {
      // TODO: better error
      throw new Error(`pending or missing earliest block`);
    }
    initialFromBlock = earliestBlock.number;
  }

  if (initialToBlock == null) {
    debug("creating latest block number stream");
    initialToBlock = await createBlockNumberStream({ publicClient, blockTag: "latest" });
  }

  const stream = new Subject<BlockEvents<TAbiEvent>>();
  fetchBlockRange(
    initialFromBlock,
    maxBlockRange,
    initialToBlock instanceof BehaviorSubject ? initialToBlock.value : initialToBlock
  );

  async function fetchBlockRange(fromBlock: bigint, maxBlockRange: number, lastBlockNumber: bigint): Promise<void> {
    try {
      const toBlock = bigIntMin(fromBlock + BigInt(maxBlockRange), lastBlockNumber);
      debug("fetching block range", { fromBlock, toBlock });

      // TODO: convert to one `getLogs` call when viem supports multiple events or topics
      const logs = (
        await Promise.all(
          events.map((event) =>
            publicClient.getLogs({
              address,
              event,
              fromBlock,
              toBlock,
              strict: true,
            })
          )
        )
      ).flat();

      // TODO: do something other than just throwing out pending logs
      const nonPendingLogs = logs.filter(isNonPendingLog);

      if (logs.length !== nonPendingLogs.length) {
        // TODO: better error
        console.warn("pending logs discarded");
      }

      // TODO: handle RPC block range errors
      // TODO: handle RPC rate limit errors (hopefully via client retry policy)

      const blockNumbers = Array.from(new Set(nonPendingLogs.map((log) => log.blockNumber)));
      blockNumbers.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

      for (const blockNumber of blockNumbers) {
        const blockLogs = nonPendingLogs.filter((log) => log.blockNumber === blockNumber);
        blockLogs.sort((a, b) => (a.logIndex < b.logIndex ? -1 : a.logIndex > b.logIndex ? 1 : 0));

        if (blockLogs.length) {
          debug("emitting events for block", { blockNumber, blockHash: blockLogs[0].blockHash, events: blockLogs });
          stream.next({
            blockNumber,
            blockHash: blockLogs[0].blockHash,
            events: blockLogs,
          });
        }
      }

      if (toBlock < lastBlockNumber) {
        fetchBlockRange(toBlock + 1n, maxBlockRange, lastBlockNumber);
        return;
      }

      if (initialToBlock instanceof BehaviorSubject) {
        if (initialToBlock.value > toBlock) {
          fetchBlockRange(toBlock + 1n, maxBlockRange, initialToBlock.value);
          return;
        }

        debug("waiting for next block");
        const sub = initialToBlock.subscribe((blockNumber) => {
          if (blockNumber > toBlock) {
            sub.unsubscribe();
            fetchBlockRange(toBlock + 1n, maxBlockRange, blockNumber);
          }
        });
        return;
      }

      stream.complete();
    } catch (error: unknown) {
      // TODO: do more specific error handling?
      stream.error(error);
    }
  }

  return stream.asObservable();
}
