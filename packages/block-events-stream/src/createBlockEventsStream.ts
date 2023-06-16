import { Subject } from "rxjs";
import type { Hex, PublicClient } from "viem";
import type { AbiEvent } from "abitype";
import { BlockEvents, BlockEventsStream, BlockNumberOrTag } from "./common";
import { bigIntMin } from "./utils";
import { isNonPendingLog } from "./isNonPendingLog";
import { debug } from "./debug";

// TODO: add nice logging with debub lib or similar
// TODO: make `toBlock` accept a `BehaviorSubject<BlockNumberOrTag>` or add `latestBlockStream` so we only need one listener/watcher/poller
// TODO: consider excluding `pending` block tags so we can just assume all block numbers are present

export type CreateBlockEventsStreamOptions<TAbiEvent extends AbiEvent> = {
  publicClient: PublicClient;
  fromBlock?: BlockNumberOrTag; // defaults to "earliest"
  toBlock?: Exclude<BlockNumberOrTag, "earliest">; // defaults to "latest"
  address?: Hex;
  events: readonly TAbiEvent[];
  maxBlockRange?: number; // defaults to 1000
};

export async function createBlockEventsStream<TAbiEvent extends AbiEvent>({
  publicClient,
  fromBlock: initialFromBlock = "earliest",
  toBlock: initialToBlock = "latest",
  address,
  events,
  maxBlockRange = 1000,
}: CreateBlockEventsStreamOptions<TAbiEvent>): Promise<BlockEventsStream<TAbiEvent>> {
  debug("createBlockEventsStream", { initialFromBlock, initialToBlock, address, events, maxBlockRange });

  debug("Getting first/last blocks");
  const [firstBlock, lastBlock] = await Promise.all([
    publicClient.getBlock(
      typeof initialFromBlock === "bigint" ? { blockNumber: initialFromBlock } : { blockTag: initialFromBlock }
    ),
    publicClient.getBlock(
      typeof initialToBlock === "bigint" ? { blockNumber: initialToBlock } : { blockTag: initialToBlock }
    ),
  ]);

  if (firstBlock.number == null) {
    // TODO: better error
    throw new Error(`pending or missing fromBlock "${initialFromBlock}"`);
  }
  if (lastBlock.number == null) {
    // TODO: better error
    throw new Error(`pending or missing toBlock "${initialToBlock}"`);
  }

  debug("Got first/last blocks", { firstBlock, lastBlock });

  const stream = new Subject<BlockEvents<TAbiEvent>>();
  fetchBlockRange(firstBlock.number, maxBlockRange, lastBlock.number);

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

      if (typeof initialToBlock !== "bigint") {
        debug("updating last block", { initialToBlock });
        const lastBlock = await publicClient.getBlock({ blockTag: initialToBlock });
        if (lastBlock.number == null) {
          // TODO: better error
          throw new Error(`pending or missing toBlock "${initialToBlock}"`);
        }

        debug("got last block", { lastBlock });
        if (lastBlock.number > toBlock) {
          fetchBlockRange(toBlock + 1n, maxBlockRange, lastBlock.number);
          return;
        }

        debug("waiting for next block");
        const unwatch = publicClient.watchBlocks({
          blockTag: initialToBlock,
          onBlock: (block) => {
            debug("got next block", block);

            if (block.number == null) {
              // TODO: better error
              throw new Error(`pending or missing toBlock "${initialToBlock}"`);
            }

            unwatch();
            fetchBlockRange(toBlock + 1n, maxBlockRange, block.number);
          },
        });
        return;
      }

      // TODO: determine if we can/should start adjusting `lastBlock` (based on if we got a block tag for `initialToBlock`)
      stream.complete();
    } catch (error: unknown) {
      // TODO: do more specific error handling?
      stream.error(error);
    }
  }

  return stream.asObservable();
}
