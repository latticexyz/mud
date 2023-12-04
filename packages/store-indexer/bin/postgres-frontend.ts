#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter, input } from "@latticexyz/store-sync/trpc-indexer";
import { createQueryAdapter } from "../src/postgres/createQueryAdapter";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { queryLogs } from "../src/postgres/queryLogs";
import { StorageAdapterLog, storeTables } from "@latticexyz/store-sync";
import { decodeDynamicField } from "@latticexyz/protocol-parser";
import { compress } from "../src/compress";
import { eventStream } from "../src/eventStream";

const env = parseEnv(
  z.intersection(
    frontendEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
    })
  )
);

const pg = postgres(env.DATABASE_URL, {
  debug: (conn, query, params) => {
    console.log("query", query);
  },
});
const database = drizzle(pg);

const server = new Koa();
server.use(compress());
server.use(cors());

const router = new Router();

// k8s healthchecks
router.get("/healthz", (ctx) => {
  ctx.status = 200;
});
router.get("/readyz", (ctx) => {
  ctx.status = 200;
});

router.get(
  "/sse/logs",
  eventStream<{
    config: { indexerVersion: string; chainId: string; lastUpdatedBlockNumber: string; totalRows: number };
    log: StorageAdapterLog;
  }>(),
  async (ctx) => {
    const opts = input.parse(typeof ctx.query.input === "string" ? JSON.parse(ctx.query.input) : {});
    opts.filters = opts.filters.length > 0 ? [...opts.filters, { tableId: storeTables.Tables.tableId }] : [];

    let hasEmittedConfig = false;

    // TODO: emit record block number via `id: ...` so we get free retries via `Last-Event-ID` header

    await queryLogs(pg, opts ?? {}).cursor(100, async (rows) => {
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
      queryAdapter: await createQueryAdapter(database),
    }),
  })
);

server.listen({ host: env.HOST, port: env.PORT });
console.log(`postgres indexer frontend listening on http://${env.HOST}:${env.PORT}`);
