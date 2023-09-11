import { AbiEvent } from "abitype";
import { Address, PublicClient, BlockNumber, GetLogsReturnType } from "viem";
import { bigIntMin, wait } from "@latticexyz/common/utils";
import { debug } from "./debug";

export type FetchLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  /**
   * [viem `PublicClient`][0] used for fetching logs from the RPC.
   *
   * [0]: https://viem.sh/docs/clients/public.html
   */
  publicClient: PublicClient;
  /**
   * Optional contract address(es) to fetch logs for.
   */
  address?: Address | Address[];
  /**
   * Events to fetch logs for.
   */
  events: TAbiEvents;
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

export type FetchLogsResult<TAbiEvents extends readonly AbiEvent[]> = {
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  logs: GetLogsReturnType<undefined, TAbiEvents, true, BlockNumber, BlockNumber>;
};

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
export async function* fetchLogs<TAbiEvents extends readonly AbiEvent[]>({
  maxBlockRange = 1000n,
  maxRetryCount = 3,
  publicClient,
  ...getLogsOpts
}: FetchLogsOptions<TAbiEvents>): AsyncGenerator<FetchLogsResult<TAbiEvents>> {
  let fromBlock = getLogsOpts.fromBlock;
  let blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
  let retryCount = 0;

  while (fromBlock <= getLogsOpts.toBlock) {
    try {
      const toBlock = fromBlock + blockRange;
      debug("getting logs", { fromBlock, toBlock });
      const logs = await publicClient.getLogs({ ...getLogsOpts, fromBlock, toBlock, strict: true });
      yield { fromBlock, toBlock, logs };
      fromBlock = toBlock + 1n;
      blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
    } catch (error: unknown) {
      debug("error getting logs:", String(error));
      if (!(error instanceof Error)) throw error;

      // TODO: figure out actual rate limit message for RPCs
      if (error.message.includes("rate limit exceeded") && retryCount < maxRetryCount) {
        const seconds = 2 * retryCount;
        debug(`too many requests, retrying in ${seconds}s`, error);
        await wait(1000 * seconds);
        retryCount += 1;
        continue;
      }

      // TODO: figure out actual block range exceeded message for RPCs
      if (error.message.includes("block range exceeded")) {
        blockRange /= 2n;
        if (blockRange <= 0n) {
          throw new Error("can't reduce block range any further");
        }
        debug("block range exceeded, trying a smaller block range", error);
        // TODO: adjust maxBlockRange down if we consistently hit this for a given block range size
        continue;
      }

      throw error;
    }
  }
}
