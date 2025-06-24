import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock, StorageAdapterLog } from "../common";
import { Result } from "@latticexyz/common";
import { streamLogs } from "./streamLogs";
import { isLogsApiResponse } from "./isLogsApiResponse";
import { toStorageAdapterBlock } from "./toStorageAdapterBlock";

export type CreateIndexerClientOptions = {
  /**
   * Indexer endpoint URL like `https://indexer.mud.redstonechain.com`.
   */
  url: string;
};

export type IndexerClient = {
  getLogs: (opts: z.input<typeof input>) => Promise<Result<StorageAdapterBlock>>;
};

/**
 * Creates a client to talk to a MUD indexer.
 *
 * @param {CreateIndexerClientOptions} options See `CreateIndexerClientOptions`.
 * @returns {IndexerClient} A typed indexer client.
 */
export function createIndexerClient({ url }: CreateIndexerClientOptions): IndexerClient {
  return {
    getLogs: async (opts): Promise<Result<StorageAdapterBlock>> => {
      try {
        const input = encodeURIComponent(JSON.stringify(opts));
        const urlOrigin = new URL(url).origin;

        const response = await fetch(`${urlOrigin}/api/logs?input=${input}`);
        if (!response.body) {
          throw new Error(`Indexer response (${response.ok}) had no body.`);
        }

        const logs: StorageAdapterLog[] = [];
        const result = await streamLogs(response.body, (log) => logs.push(log));

        if (!isLogsApiResponse(result)) {
          return { error: result };
        }

        return { ok: toStorageAdapterBlock({ ...result, logs }) };
      } catch (error) {
        return { error };
      }
    },
  };
}
