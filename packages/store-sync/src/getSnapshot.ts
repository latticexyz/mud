import { StorageAdapterBlock, SyncOptions } from "./common";
import { debug as parentDebug } from "./debug";
import { TRPCClientError } from "@trpc/client";
import { tablesWithRecordsToLogs } from "./tablesWithRecordsToLogs";
import { createIndexerClient as createTrpcIndexerClient } from "./trpc-indexer";
import { createIndexerClient } from "./indexer-client";
import { isOk } from "@latticexyz/common";

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
  const trpcIndexer = createTrpcIndexerClient({ url: `${indexerOrigin}/trpc` });

  debug("fetching logs from indexer via get", indexerUrl);
  const result = await indexer.getLogs({ chainId, address, filters });
  if (isOk(result)) return result.ok;
  console.warn(result.error);

  try {
    // Backwards compatibility with older indexers
    // TODO: remove in the future
    debug("fetching logs from indexer via trpc", indexerUrl);
    return await trpcIndexer.getLogs.query({ chainId, address, filters });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // Backwards compatibility with older indexers
      // TODO: remove in the future
      debug("failed to fetch logs, fetching table records instead", indexerUrl);
      const result = await trpcIndexer.findAll.query({ chainId, address, filters });
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
