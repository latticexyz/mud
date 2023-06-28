import { BehaviorSubject, Subject } from "rxjs";
import type { BlockNumber, Hex, PublicClient } from "viem";
import type { AbiEvent } from "abitype";
import { BlockEvents, BlockEventsStream, ReadonlyBehaviorSubject } from "./common";
import { bigIntMin, bigIntSort } from "./utils";
import { isNonPendingLog } from "./isNonPendingLog";
import { debug } from "./debug";
import { createBlockNumberStream } from "./createBlockNumberStream";
import { getLogs } from "./getLogs";

export type CreateBlockEventsStreamOptions<TAbiEvent extends AbiEvent> = {
  publicClient: PublicClient;
  fromBlock?: BlockNumber;
  toBlock?: BlockNumber | ReadonlyBehaviorSubject<BlockNumber>;
  address?: Hex;
  events: readonly TAbiEvent[];
  /** Defaults to 1000 */
  maxBlockRange?: number;
};

export type CreateBlockEventsStreamResult<TAbiEvent extends AbiEvent> = {
  stream: BlockEventsStream<TAbiEvent>;
  close: () => void;
};

export async function createBlockEventsStream<TAbiEvent extends AbiEvent>({
  publicClient,
  fromBlock: initialFromBlock,
  toBlock: initialToBlock,
  address,
  events,
  maxBlockRange = 1000,
}: CreateBlockEventsStreamOptions<TAbiEvent>): Promise<CreateBlockEventsStreamResult<TAbiEvent>> {
  debug("createBlockEventsStream", { initialFromBlock, initialToBlock, address, events, maxBlockRange });

  if (initialFromBlock == null) {
    debug("getting earliest block");
    const earliestBlock = await publicClient.getBlock({ blockTag: "earliest" });
    debug("earliest block", earliestBlock);
    if (earliestBlock.number == null) {
      // This is an edge case that shouldn't happen unless you are ignoring types or something weird happens with viem/RPC.
      throw new Error(`pending or missing earliest block`);
    }
    initialFromBlock = earliestBlock.number;
  }

  let closeInitialToBlock: (() => void) | undefined;
  if (initialToBlock == null) {
    debug("creating latest block number stream");
    const blockNumber$ = await createBlockNumberStream({ publicClient, blockTag: "latest" });
    initialToBlock = blockNumber$.stream;
    closeInitialToBlock = blockNumber$.close;
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

      // TODO: handle RPC block range errors
      // TODO: handle RPC rate limit errors (hopefully via viem client retry policy)
      // TODO: swap this with viem `getLogs` call when viem supports multiple events: https://github.com/wagmi-dev/viem/pull/633
      const logs = await getLogs({
        publicClient,
        address,
        fromBlock,
        toBlock,
        events,
      });

      const nonPendingLogs = logs.filter(isNonPendingLog);
      if (logs.length !== nonPendingLogs.length) {
        // This is an edge case that shouldn't happen unless you are ignoring types or something weird happens with viem/RPC.
        console.warn("pending logs discarded");
      }

      const blockNumbers = Array.from(new Set(nonPendingLogs.map((log) => log.blockNumber)));
      blockNumbers.sort(bigIntSort);

      for (const blockNumber of blockNumbers) {
        const blockLogs = nonPendingLogs.filter((log) => log.blockNumber === blockNumber);
        blockLogs.sort((a, b) => (a.logIndex < b.logIndex ? -1 : a.logIndex > b.logIndex ? 1 : 0));

        if (blockLogs.length) {
          debug("emitting events for block", { blockNumber, blockHash: blockLogs[0].blockHash, events: blockLogs });
          stream.next({
            blockNumber,
            blockHash: blockLogs[0].blockHash,
            events: blockLogs,
            // TODO: figure out why we need to cast this
          } as any as BlockEvents<TAbiEvent>);
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

        if (!initialToBlock.closed) {
          debug("waiting for next block");
          const sub = initialToBlock.subscribe((blockNumber) => {
            if (blockNumber > toBlock) {
              sub.unsubscribe();
              fetchBlockRange(toBlock + 1n, maxBlockRange, blockNumber);
            }
          });
          return;
        }
      }

      stream.complete();
    } catch (error: unknown) {
      // TODO: do more specific error handling?
      stream.error(error);
    }
  }

  return {
    stream: stream.asObservable(),
    close: (): void => {
      stream.complete();
      if (initialToBlock instanceof BehaviorSubject) {
        initialToBlock.complete();
      }
      closeInitialToBlock?.();
    },
  };
}
