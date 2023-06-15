import { Subject } from "rxjs";
import type { Hex, PublicClient } from "viem";
import type { AbiEvent } from "abitype";
import { BlockEvents, BlockEventsStream, BlockNumberOrTag } from "./common";
import { bigIntMin } from "./utils";
import { excludePendingLogs } from "./excludePendingLogs";

// TODO: add nice logging with debub lib or similar
// TODO: make `toBlock` accept a `BehaviorSubject<BlockNumberOrTag>` or add `latestBlockStream` so we only need one listener/watcher/poller
// TODO: consider excluding `pending` block tags so we can just assume all block numbers are present

export type CreateBlockEventsStreamOptions<TAbiEvent extends AbiEvent> = {
  publicClient: PublicClient;
  fromBlock?: BlockNumberOrTag; // defaults to "earliest"
  toBlock?: BlockNumberOrTag; // defaults to "latest"
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

  const stream = new Subject<BlockEvents<TAbiEvent>>();
  fetchBlockRange(firstBlock.number, maxBlockRange, lastBlock.number);

  async function fetchBlockRange(fromBlock: bigint, maxBlockRange: number, lastBlockNumber: bigint): Promise<void> {
    try {
      const toBlock = bigIntMin(fromBlock + BigInt(maxBlockRange), lastBlockNumber);

      // TODO: convert to one `getLogs` call when viem supports multiple events or topics
      // TODO: do something other than just throwing out pending logs
      const logs = excludePendingLogs(
        (
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
        ).flat()
      );

      // TODO: handle RPC block range errors
      // TODO: handle RPC rate limit errors (hopefully via client retry policy)

      const blockNumbers = Array.from(new Set(logs.map((log) => log.blockNumber)));
      blockNumbers.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

      for (const blockNumber of blockNumbers) {
        const blockLogs = logs.filter((log) => log.blockNumber === blockNumber);
        blockLogs.sort((a, b) => (a.logIndex < b.logIndex ? -1 : a.logIndex > b.logIndex ? 1 : 0));

        stream.next({
          blockNumber,
          blockHash: blockLogs[0].blockHash,
          events: blockLogs,
        });
      }

      if (toBlock > lastBlockNumber) {
        fetchBlockRange(toBlock + 1n, maxBlockRange, lastBlockNumber);
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
