import { FetchLogsOptions } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi } from "@latticexyz/store";
import { StorageAdapter, StorageAdapterBlock, StoreEventsLog } from "./common";
import { fetchAndFilterLogs } from "./fetchAndFilterLogs";

type FetchAndStoreLogsOptions = FetchLogsOptions<StoreEventsAbi> & {
  storageAdapter: StorageAdapter;
  logFilter?: (log: StoreEventsLog) => boolean;
};

export async function* fetchAndStoreLogs({
  storageAdapter,
  ...fetchAndFilterLogsOptions
}: FetchAndStoreLogsOptions): AsyncGenerator<StorageAdapterBlock> {
  for await (const block of fetchAndFilterLogs(fetchAndFilterLogsOptions)) {
    await storageAdapter(block);
    yield block;
  }
}
