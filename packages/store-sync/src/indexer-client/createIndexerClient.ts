import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock } from "../common";

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
      const result = await response.json();
      if (!isStorageAdapterBlock(result)) {
        throw new Error("Unexpected response:\n" + JSON.stringify(result));
      }

      return { ...result, blockNumber: BigInt(result.blockNumber) };
    },
  };
}

function isStorageAdapterBlock(data: any): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string } {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}
