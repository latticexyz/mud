import { FetchLogsOptions, fetchLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi } from "@latticexyz/store";
import { StorageAdapterBlock, StoreEventsLog } from "./common";

type FetchAndFilterLogsOptions = FetchLogsOptions<StoreEventsAbi> & {
  logFilter?: (log: StoreEventsLog) => boolean;
};

export async function* fetchAndFilterLogs({
  logFilter,
  ...fetchLogsOptions
}: FetchAndFilterLogsOptions): AsyncGenerator<StorageAdapterBlock> {
  for await (const { logs, toBlock } of fetchLogs(fetchLogsOptions)) {
    const blocks = groupLogsByBlockNumber(logFilter ? logs.filter(logFilter) : logs, toBlock);
    for (const block of blocks) {
      yield block;
    }
  }
}
