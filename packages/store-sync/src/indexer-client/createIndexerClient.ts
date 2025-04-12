import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock } from "../common";
import { Result } from "@latticexyz/common";
import { isLogsApiResponse } from "./isLogsApiResponse";
import { toStorageAdapterBlock } from "./toStorageAdapterBlock";

export type CreateIndexerClientOptions = {
  /**
   * Indexer endpoint URL like `https://indexer.holesky.redstone.xyz`.
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
        const response = await fetch(`${urlOrigin}/api/2/logs?input=${input}`, { method: "GET" });

        // TODO: return a readable stream instead of fetching the entire response at once
        const result = await response.json();
        if (!isLogsApiResponse(result)) {
          return { error: result };
        }

        return { ok: toStorageAdapterBlock(result) };
      } catch (error) {
        return { error };
      }
    },
  };
}
