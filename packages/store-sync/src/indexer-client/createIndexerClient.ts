import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock } from "../common";
import superjson from "superjson";

type CreateIndexerClientOptions = {
  /**
   * tRPC endpoint URL like `https://indexer.dev.linfra.xyz/trpc`.
   */
  url: string;
};

type IndexerClient = {
  getLogs: (opts: z.input<typeof input>) => Promise<StorageAdapterBlock>;
};

/**
 * Creates a client to talk to a MUD indexer.
 *
 * @param {CreateIndexerClientOptions} options See `CreateIndexerClientOptions`.
 * @returns {IndexerClient} A typed indexer client.
 */
export function createIndexerClient({ url }: CreateIndexerClientOptions): IndexerClient {
  return {
    getLogs: async (opts): Promise<StorageAdapterBlock> => {
      const input = encodeURIComponent(JSON.stringify(opts));
      const response = await fetch(`${url}/get/logs?input=${input}`, { method: "GET" });

      // TODO: could we return a readable stream here instead of fetching the entire response right away?
      const result = superjson.parse(await response.text());
      if (!isStorageAdapterBlock(result)) {
        throw new Error("Unexpected response:\n" + superjson.stringify(result));
      }

      return result;
    },
  };
}

function isStorageAdapterBlock(data: any): data is StorageAdapterBlock {
  return data && typeof data.blockNumber === "bigint" && Array.isArray(data.logs);
}
