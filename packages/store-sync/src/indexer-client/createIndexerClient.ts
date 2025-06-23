import { z } from "zod";
import { input } from "./input";
import { StorageAdapterBlock, StorageAdapterLog } from "../common";
import { Result } from "@latticexyz/common";
import { isLogsApiResponse } from "./isLogsApiResponse";
import { toStorageAdapterBlock } from "./toStorageAdapterBlock";
import oboe from "oboe";
import { streamLogs } from "./streamLogs";

export type CreateIndexerClientOptions = {
  /**
   * Indexer endpoint URL like `https://indexer.mud.redstone.xyz`.
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
        console.log(`${urlOrigin}/api/logs?input=${input}`);

        const response = await fetch(`${urlOrigin}/api/logs?input=${input}`);
        if (!response.body) {
          throw new Error(`Indexer response (${response.ok}) had no body.`);
        }

        let i = 0;
        console.log("starting json stream", response.status);
        let blockNumber: bigint | null = null;
        let logs: StorageAdapterLog[] = [];
        await streamLogs(response.body, (bn, log) => {
          blockNumber = bn;
          logs.push(log);
          if (++i % 100000 === 0) {
            console.log("read logs", i.toLocaleString());
          }
          console.log("log", bn, log);
          throw new Error("stop");
        });
        console.log("got logs", logs);

        return { ok: { blockNumber: blockNumber!, logs } };

        console.log("done");

        const result = await new Promise((resolve, reject) => {
          console.log("streaming indexer response with oboe");
          let i = 0;
          oboe(response)
            .node("logs.*", () => {
              if (++i % 100000 === 0) {
                console.log("read logs", i.toLocaleString());
              }
              return oboe.drop;
            })
            .node("*", () => oboe.drop)
            .done(resolve)
            .fail(reject);
        });

        // let blockNumber;
        // return new Promise((resolve, reject) => {
        //   oboe(res)
        //     .node("blockNumber", (value) => (blockNumber = log))
        //     .node("logs.*", (log, path, ancestors) => {
        //       const root = ancestors[0];
        //       const blockNumber = root.blockNumber;

        //       // console.log("Log item:", { blockNumber, log });

        //       // tell oboe not to hold on to these in memory to avoid OOM errors
        //       return oboe.drop;
        //     })
        //     .done((result) => {
        //       console.log("Done streaming logs", result);

        //       reject(new Error("TODO"));
        //     })
        //     .fail((reason) => {
        //       reject("Failed");
        //     });
        // });

        // TODO: return a readable stream instead of fetching the entire response at once

        if (!isLogsApiResponse(result)) {
          return { error: result };
        }
        console.log("returning logs", result.logs.length);

        return { ok: toStorageAdapterBlock(result) };
      } catch (error) {
        return { error };
      }
    },
  };
}
