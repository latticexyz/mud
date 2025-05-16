import {
  Address,
  BlockNumber,
  GetLogsReturnType,
  OneOf,
  AbiEvent,
  toEventSelector,
  parseEventLogs,
  BlockNotFoundError,
  LogTopic,
} from "viem";
import { bigIntMax, bigIntMin, wait } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { getLogs } from "./getLogs";
import { BlockRange } from "./common";
import { GetRpcClientOptions } from "./getRpcClient";

export type FetchLogsOptions<abiEvents extends readonly AbiEvent[]> = BlockRange & {
  /**
   * Optional maximum block range, if your RPC limits the amount of blocks fetched at a time. Defaults to 1000n.
   */
  maxBlockRange?: bigint;
  /**
   * Optional maximum amount of retries if the RPC returns a rate limit error. Defaults to 3.
   */
  maxRetryCount?: number;
} & OneOf<
    | {
        /**
         * Async function to return logs for the given block range.
         */
        getLogs: (args: {
          fromBlock: bigint;
          toBlock: bigint;
        }) => Promise<GetLogsReturnType<undefined, abiEvents, true, BlockNumber, BlockNumber>>;
      }
    | (GetRpcClientOptions & {
        /**
         * Optional contract address(es) to fetch logs for.
         */
        address?: Address | Address[];
      } & (
          | {
              /**
               * Events to fetch logs for.
               */
              events: abiEvents;
            }
          | {
              /**
               * Topics to filter logs by.
               */
              topics: LogTopic[];
            }
        ))
  >;

export type FetchLogsResult<abiEvents extends readonly AbiEvent[]> = BlockRange & {
  logs: GetLogsReturnType<undefined, abiEvents, true, BlockNumber, BlockNumber>;
};

const RATE_LIMIT_ERRORS = [
  // tests
  "rate limit exceeded",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L83
  "over rate limit",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L88
  "sender is over rate limit",
];

// These errors will reduce the max block range for all remaining iterations.
const MAX_BLOCK_RANGE_ERRORS = [
  // tests
  "block range exceeded",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/rewriter.go#L36
  "block range is too large",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L750
  "block range greater than",
  // https://github.com/paradigmxyz/reth/blob/b5adf24a65e83bc48da16fd722d369a28d12f644/crates/rpc/rpc-eth-types/src/logs_utils.rs#L25
  "query exceeds max block range",
  // https://github.com/latticexyz/mud/issues/1522#issuecomment-2105435114
  "exceed maximum block range",
];

// These errors will temporarily reduce the block range for the current request until it succeeds, then revert back to max block range.
const BLOCK_RANGE_ERRORS = [
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L98
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/rewriter.go#L35
  "block is out of range",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L110
  "backend response too large",
  // https://github.com/paradigmxyz/reth/blob/b5adf24a65e83bc48da16fd722d369a28d12f644/crates/rpc/rpc-eth-types/src/logs_utils.rs#L28
  "query exceeds max results",
];

const MISSING_BLOCK_ERRORS = ["block not found", "unknown block", "Unknown block"];

/**
 * An asynchronous generator function that fetches logs from the blockchain in a range of blocks.
 *
 * @remarks
 * The function will fetch logs according to the given options.
 * It will iteratively move forward in the block range, yielding fetched logs as they become available.
 * If the function encounters rate limits, it will retry until `maxRetryCount` is reached.
 * If the function encounters a block range that is too large, it will half the block range and retry, until the block range can't be halved anymore.
 *
 * @param {FetchLogsOptions<AbiEvent[]>} options See `FetchLogsOptions`.
 *
 * @yields The result of the fetched logs for each block range in the given range.
 *
 * @throws Will throw an error if the block range can't be reduced any further.
 */
export async function* fetchLogs<abiEvents extends readonly AbiEvent[]>({
  maxBlockRange = 1000n,
  maxRetryCount = 3,
  fromBlock: initialFromBlock,
  toBlock: initialToBlock,
  ...opts
}: FetchLogsOptions<abiEvents>): AsyncGenerator<FetchLogsResult<abiEvents>> {
  const requestLogs =
    opts.getLogs ??
    (async (
      blockRange: BlockRange,
    ): Promise<GetLogsReturnType<undefined, abiEvents, true, BlockNumber, BlockNumber>> => {
      const topics = opts.topics ?? (opts.events ? [opts.events.map((event) => toEventSelector(event))] : undefined);
      const logs = await getLogs({
        ...opts,
        ...blockRange,
        topics,
      });
      return opts.events ? parseEventLogs({ logs, abi: opts.events }) : (logs as FetchLogsResult<abiEvents>["logs"]);
    });

  let fromBlock = initialFromBlock;
  let blockRange = bigIntMin(maxBlockRange, initialToBlock - fromBlock);
  let retryCount = 0;

  while (fromBlock <= initialToBlock) {
    const toBlock = fromBlock + bigIntMax(0n, blockRange - 1n);
    debug(`getting logs for blocks ${fromBlock}-${toBlock} (${blockRange} blocks, ${maxBlockRange} max)`);

    try {
      const logs = await requestLogs({ fromBlock, toBlock });
      yield { fromBlock, toBlock, logs };
      fromBlock = toBlock + 1n;
      blockRange = bigIntMin(maxBlockRange, initialToBlock - fromBlock);
      retryCount = 0;
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;

      if (retryCount < maxRetryCount && RATE_LIMIT_ERRORS.some((e) => error.message.includes(e))) {
        const seconds = 2 * retryCount;
        debug(`too many requests, retrying in ${seconds}s`);
        await wait(1000 * seconds);
        retryCount += 1;
        continue;
      }

      const isMaxBlockRangeError = MAX_BLOCK_RANGE_ERRORS.some((e) => error.message.includes(e));
      const isBlockRangeError = BLOCK_RANGE_ERRORS.some((e) => error.message.includes(e));
      if (isMaxBlockRangeError || isBlockRangeError) {
        blockRange /= 2n;
        if (blockRange <= 0n) {
          throw new Error("can't reduce block range any further");
        }
        if (isMaxBlockRangeError) {
          maxBlockRange = blockRange;
        }
        debug(`got block range error, retrying with ${blockRange} blocks, ${maxBlockRange} max`);
        continue;
      }

      if (
        retryCount < maxRetryCount &&
        (MISSING_BLOCK_ERRORS.some((e) => error.message.includes(e)) ||
          error.message === new BlockNotFoundError({ blockNumber: toBlock }).message)
      ) {
        const seconds = 2 * retryCount;
        debug(`missing block, retrying in ${seconds}s`);
        await wait(1000 * seconds);
        retryCount += 1;
        continue;
      }

      throw error;
    }
  }
}
