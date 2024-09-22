import { AbiEvent } from "abitype";
import { Address, Client, BlockNumber, GetLogsReturnType } from "viem";
import { bigIntMin, wait } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { getAction } from "viem/utils";
import { getLogs } from "viem/actions";

export type FetchLogsOptions<abiEvents extends readonly AbiEvent[]> = {
  /**
   * [viem `Client`][0] used for fetching logs from the RPC.
   *
   * [0]: https://viem.sh/docs/clients/public.html
   */
  publicClient: Client;
  /**
   * Optional contract address(es) to fetch logs for.
   */
  address?: Address | Address[];
  /**
   * Events to fetch logs for.
   */
  events: abiEvents;
  /**
   * The block number to start fetching logs from (inclusive).
   */
  fromBlock: BlockNumber;
  /**
   * The block number to stop fetching logs at (inclusive).
   */
  toBlock: BlockNumber;
  /**
   * Optional maximum block range, if your RPC limits the amount of blocks fetched at a time. Defaults to 1000n.
   */
  maxBlockRange?: bigint;
  /**
   * Optional maximum amount of retries if the RPC returns a rate limit error. Defaults to 3.
   */
  maxRetryCount?: number;
};

export type FetchLogsResult<abiEvents extends readonly AbiEvent[]> = {
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  logs: GetLogsReturnType<undefined, abiEvents, true, BlockNumber, BlockNumber>;
};

const RATE_LIMIT_ERRORS = [
  "rate limit exceeded",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L83
  "over rate limit",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L88
  "sender is over rate limit",
];

const BLOCK_RANGE_TOO_LARGE_ERRORS = [
  "block range exceeded",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L110
  "backend response too large",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/rewriter.go#L36
  "block range is too large",
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/backend.go#L98
  // https://github.com/ethereum-optimism/optimism/blob/4fb534ab3d924ac87383e1e70ae4872340d68d9d/proxyd/rewriter.go#L35
  "block is out of range",
  // https://github.com/paradigmxyz/reth/blob/b5adf24a65e83bc48da16fd722d369a28d12f644/crates/rpc/rpc-eth-types/src/logs_utils.rs#L25
  "query exceeds max block range",
  // https://github.com/paradigmxyz/reth/blob/b5adf24a65e83bc48da16fd722d369a28d12f644/crates/rpc/rpc-eth-types/src/logs_utils.rs#L28
  "query exceeds max results",
];

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
  publicClient,
  ...getLogsOpts
}: FetchLogsOptions<abiEvents>): AsyncGenerator<FetchLogsResult<abiEvents>> {
  let fromBlock = getLogsOpts.fromBlock;
  let blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
  let retryCount = 0;

  while (fromBlock <= getLogsOpts.toBlock) {
    try {
      const toBlock = fromBlock + blockRange;
      debug("getting logs", { fromBlock, toBlock });
      const logs = await getAction(
        publicClient,
        getLogs,
        "getLogs",
      )({ ...getLogsOpts, fromBlock, toBlock, strict: true });
      yield { fromBlock, toBlock, logs };
      fromBlock = toBlock + 1n;
      blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
    } catch (error: unknown) {
      debug("error getting logs:", String(error));
      if (!(error instanceof Error)) throw error;

      if (retryCount < maxRetryCount && RATE_LIMIT_ERRORS.some((e) => error.message.includes(e))) {
        const seconds = 2 * retryCount;
        debug(`too many requests, retrying in ${seconds}s`, error);
        await wait(1000 * seconds);
        retryCount += 1;
        continue;
      }

      if (BLOCK_RANGE_TOO_LARGE_ERRORS.some((e) => error.message.includes(e))) {
        blockRange /= 2n;
        if (blockRange <= 0n) {
          throw new Error("can't reduce block range any further");
        }
        debug("block range exceeded or too many logs in range, trying a smaller block range", error);
        // TODO: adjust maxBlockRange down if we consistently hit this for a given block range size
        continue;
      }

      throw error;
    }
  }
}
