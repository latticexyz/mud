import { AbiEvent, Address } from "abitype";
import { GetLogsResult, getLogs } from "./getLogs";
import { bigIntMin, wait } from "./utils";
import { PublicClient, BlockNumber, LimitExceededRpcError } from "viem";
import { debug } from "./debug";

export type FetchLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  publicClient: PublicClient;
  address?: Address | Address[];
  events: TAbiEvents;
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  maxBlockRange?: bigint;
  retryCount?: number;
};

export type FetchLogsResult<TAbiEvents extends readonly AbiEvent[]> = {
  fromBlock: BlockNumber;
  toBlock: BlockNumber;
  logs: GetLogsResult<TAbiEvents>;
};

export async function fetchLogs<TAbiEvents extends readonly AbiEvent[]>({
  maxBlockRange = 1000n,
  retryCount = 0,
  ...getLogsOpts
}: FetchLogsOptions<TAbiEvents>): Promise<FetchLogsResult<TAbiEvents>> {
  try {
    const fromBlock = getLogsOpts.fromBlock;
    const blockRange = bigIntMin(maxBlockRange, getLogsOpts.toBlock - fromBlock);
    const toBlock = fromBlock + blockRange;

    const logs = await getLogs({ ...getLogsOpts, fromBlock, toBlock });
    return { fromBlock, toBlock, logs };
  } catch (error: unknown) {
    if (!(error instanceof Error)) throw error;

    if (error.message === "rate limit" && retryCount < 10) {
      const seconds = 2 * retryCount;
      debug(`too many requests, retrying in ${seconds}s`, error);
      await wait(1000 * seconds);
      return await fetchLogs({ ...getLogsOpts, maxBlockRange, retryCount: retryCount + 1 });
    }

    // TODO: replace this with a real error
    if (error.message === "block range exceeded") {
      const blockRange = getLogsOpts.toBlock - getLogsOpts.fromBlock;
      const newBlockRange = blockRange / 2n;
      if (newBlockRange <= 0n) {
        throw new Error("can't reduce block range any further");
      }
      debug("block range exceeded, trying a smaller block range", error);
      return await fetchLogs({
        ...getLogsOpts,
        toBlock: getLogsOpts.fromBlock + newBlockRange,
        maxBlockRange,
        retryCount,
      });
    }

    throw error;
  }
}
