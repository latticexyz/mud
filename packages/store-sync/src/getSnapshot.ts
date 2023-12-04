import { StorageAdapterBlock, SyncOptions } from "./common";
import { debug as parentDebug } from "./debug";
import { createIndexerClient } from "./trpc-indexer";
import { TRPCClientError } from "@trpc/client";
import { tablesWithRecordsToLogs } from "./tablesWithRecordsToLogs";

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

  const indexer = createIndexerClient({ url: indexerUrl });

  try {
    debug("fetching logs from indexer", indexerUrl);
    return await indexer.getLogs.query({ chainId, address, filters });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // Backwards compatibility with older indexers
      // TODO: remove in the future
      debug("failed to fetch logs, fetching table records instead", indexerUrl);
      const result = await indexer.findAll.query({ chainId, address, filters });
      // warn after we fetch from old endpoint so we know that the indexer is accessible
      console.warn(
        `The indexer at ${indexerUrl} appears to be outdated. Consider upgrading to a recent version for better performance.`
      );

      // if the indexer returns no block number, it hasn't indexed this chain
      if (result.blockNumber == null) {
        return;
      }
      return {
        blockNumber: result.blockNumber,
        logs: tablesWithRecordsToLogs(result.tables),
      };
    }
    throw error;
  }
}
