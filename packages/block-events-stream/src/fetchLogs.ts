import { AbiEvent, Address } from "abitype";
import { PublicClient, BlockNumber } from "viem";
import { GetLogsResult, getLogs } from "./getLogs";
import { bigIntMin, wait } from "./utils";
import { debug } from "./debug";

export type FetchLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  publicClient: PublicClient;
  address?: Address | Address[];
  events: TAbiEvents;
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  maxBlockRange?: bigint;
  maxRetryCount?: number;
};

export type FetchLogsResult<TAbiEvents extends readonly AbiEvent[]> = {
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  logs: GetLogsResult<TAbiEvents>;
};

export async function* fetchLogs<TAbiEvents extends readonly AbiEvent[]>({
  maxBlockRange = 1000n,
  maxRetryCount = 3,
  ...getLogsOpts
}: FetchLogsOptions<TAbiEvents>): AsyncGenerator<FetchLogsResult<TAbiEvents>> {
  let fromBlock = getLogsOpts.fromBlock;
  let blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
  let retryCount = 0;

  while (fromBlock <= getLogsOpts.toBlock) {
    try {
      const toBlock = fromBlock + blockRange;
      const logs = await getLogs({ ...getLogsOpts, fromBlock, toBlock });
      yield { fromBlock, toBlock, logs };
      fromBlock = toBlock + 1n;
      blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;

      if (error.message.includes("rate limit exceeded") && retryCount < maxRetryCount) {
        const seconds = 2 * retryCount;
        debug(`too many requests, retrying in ${seconds}s`, error);
        await wait(1000 * seconds);
        retryCount += 1;
        continue;
      }

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
