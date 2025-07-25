import { StorageAdapterBlock, SyncOptions } from "./common";
import { debug as parentDebug } from "./debug";
import { tablesWithRecordsToLogs } from "./tablesWithRecordsToLogs";
import { createIndexerClient } from "./indexer-client";
import { unwrap } from "@latticexyz/common";

const debug = parentDebug.extend("getSnapshot");

type GetSnapshotOptions = Pick<
  SyncOptions,
  "address" | "filters" | "indexerUrl" | "initialBlockLogs" | "initialState"
> & {
  chainId: number;
};

export async function getSnapshot({
  chainId,
  address,
  filters,
  initialState,
  initialBlockLogs,
  indexerUrl,
}: GetSnapshotOptions): Promise<StorageAdapterBlock | undefined> {
  // TODO: extend types to enforce this
  if (initialBlockLogs && initialState) {
    throw new Error("Only one of initialBlockLogs or initialState should be provided.");
  }

  if (initialBlockLogs) return initialBlockLogs;

  // Backwards compatibility with older indexers
  // TODO: remove in the future
  if (initialState) {
    return {
      blockNumber: initialState.blockNumber,
      logs: tablesWithRecordsToLogs(initialState.tables),
    };
  }

  if (!indexerUrl) return;

  const indexerOrigin = new URL(indexerUrl).origin;
  const indexer = createIndexerClient({ url: indexerOrigin });

  debug("fetching logs from indexer via get", indexerUrl);
  return unwrap(await indexer.getLogs({ chainId, address, filters }));
}
