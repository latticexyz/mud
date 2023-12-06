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
      try {
        const input = encodeURIComponent(JSON.stringify(opts));
        const response = await fetch(`${url}/api/logs?input=${input}`, { method: "GET" });

        // TODO: return a readable stream instead of fetching the entire response at once
        const result = await response.json();
        if (!isStorageAdapterBlock(result)) {
          return { error: result };
        }

        return { ok: { ...result, blockNumber: BigInt(result.blockNumber) } };
      } catch (error) {
        return { error };
      }
    },
  };
}

function isStorageAdapterBlock(data: any): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string } {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}
