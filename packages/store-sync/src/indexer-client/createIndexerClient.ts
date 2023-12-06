import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock } from "../common";
import { Result } from "@latticexyz/common";

type CreateIndexerClientOptions = {
  /**
   * Indexer endpoint URL like `https://indexer.holesky.redstone.xyz`.
   */
  url: string;
};

type IndexerClient = {
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
      const input = encodeURIComponent(JSON.stringify(opts));
      const response = await fetch(`${url}/api/logs?input=${input}`, { method: "GET" });

      // TODO: could we return a readable stream here instead of fetching the entire response right away?
      const result = await response.json();
      if (!isStorageAdapterBlock(result)) {
        return { error: "Unexpected response:\n" + JSON.stringify(result) };
      }

      return { ok: { ...result, blockNumber: BigInt(result.blockNumber) } };
    },
  };
}

function isStorageAdapterBlock(data: any): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string } {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}
