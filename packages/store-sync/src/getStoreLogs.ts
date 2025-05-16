import { FetchLogsOptions, fetchLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi } from "@latticexyz/store";
import { StorageAdapterBlock, StoreEventsLog } from "./common";
import { Hex } from "viem";
import { debug } from "./debug";

type GetStoreLogsOptions = FetchLogsOptions<StoreEventsAbi> & {
  indexerUrl?: string;
  tableIds?: Hex[];
};

export async function getStoreLogs({
  indexerUrl,
  tableIds,
  ...fetchLogsOptions
}: GetStoreLogsOptions): Promise<StorageAdapterBlock> {
  try {
    if (indexerUrl) {
      const { fromBlock, toBlock } = fetchLogsOptions;
      // TODO: fetch logs from indexer
      return {
        blockNumber: toBlock,
        logs: [],
      };
    }
  } catch (error) {
    debug("Failed to fetch logs from indexer, falling back to RPC", error);
  }

  const { fromBlock, toBlock } = fetchLogsOptions;
  const logs: StoreEventsLog[] = [];
  for await (const { logs } of fetchLogs<StoreEventsAbi>(fetchLogsOptions)) {
    const filteredLogs = tableIds ? logs.filter((log) => tableIds.includes(log.args.tableId)) : logs;
    logs.push(...filteredLogs);
  }
  return {
    blockNumber: toBlock,
    logs,
  };
}
