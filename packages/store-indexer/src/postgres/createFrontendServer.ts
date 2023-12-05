import { Sql } from "postgres";
import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter, input } from "@latticexyz/store-sync/trpc-indexer";
import { createQueryAdapter } from "./createQueryAdapter";
import { compress } from "../compress";
import { healthcheck } from "../healthcheck";
import { eventStream } from "../eventStream";
import { StorageAdapterLog, storeTables } from "@latticexyz/store-sync";
import { queryLogs } from "./queryLogs";
import { decodeDynamicField } from "@latticexyz/protocol-parser";
import { drizzle } from "drizzle-orm/postgres-js";

type CreateFrontendServerOptions = {
  database: Sql;
};

export function createFrontendServer({ database }: CreateFrontendServerOptions): Koa {
  const server = new Koa();
  server.use(cors());
  server.use(healthcheck());

  server.use(async (ctx, next) => {
    if (ctx.path === "/") {
      ctx.status = 200;
      ctx.body = "emit HelloWorld();";
      return;
    }
    await next();
  });

  const router = new Router();

  router.get(
    "/sse/logs",
    compress(),
    eventStream<{
      config: { indexerVersion: string; chainId: string; lastUpdatedBlockNumber: string; totalRows: number };
      log: StorageAdapterLog;
    }>(),
    async (ctx) => {
      const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
      opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];

      let hasEmittedConfig = false;

      // TODO: emit record block number via `id: ...` so we get free retries via `Last-Event-ID` header
      await queryLogs(database, opts ?? {}).cursor(100, async (rows) => {
        if (!hasEmittedConfig && rows.length) {
          ctx.send("config", {
            indexerVersion: rows[0].indexerVersion,
            chainId: rows[0].chainId,
            lastUpdatedBlockNumber: rows[0].chainBlockNumber,
            totalRows: rows[0].totalRows,
          });
          hasEmittedConfig = true;
        }

        rows.forEach((row) => {
          ctx.send("log", {
            // TODO: either properly encode bigints in a JSON-safe way or fix these types
            blockNumber: row.chainBlockNumber as unknown as bigint,
            address: row.address,
            eventName: "Store_SetRecord",
            args: {
              tableId: row.tableId,
              keyTuple: decodeDynamicField("bytes32[]", row.keyBytes),
              staticData: row.staticData ?? "0x",
              encodedLengths: row.encodedLengths ?? "0x",
              dynamicData: row.dynamicData ?? "0x",
            },
          });
        });
      });

      // TODO: subscribe + continue writing
    }
  );

  server.use(router.routes());
  server.use(router.allowedMethods());

  server.use(
    createKoaMiddleware({
      prefix: "/trpc",
      router: createAppRouter(),
      createContext: async () => ({
        // TODO: update query adapter to take in postgres.Sql instead
        queryAdapter: await createQueryAdapter(drizzle(database)),
      }),
    })
  );

  return server;
}
