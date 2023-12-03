#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import Koa from "koa";
import compress from "koa-compress";
import cors from "@koa/cors";
import Router from "@koa/router";
import compressible from "compressible";
import { createKoaMiddleware } from "trpc-koa-adapter";
import { createAppRouter, input } from "@latticexyz/store-sync/trpc-indexer";
import { createQueryAdapter } from "../src/postgres/createQueryAdapter";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { frontendEnvSchema, parseEnv } from "./parseEnv";
import { queryLogs } from "../src/postgres/queryLogs";
import { PassThrough } from "node:stream";
import { StorageAdapterLog } from "@latticexyz/store-sync";
import { decodeDynamicField } from "@latticexyz/protocol-parser";

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
server.use(
  compress({
    // TODO: figure out if we can force compression to flush during streaming
    // TODO: this seems to be bypassed by trpc
    filter: (mimeType) => {
      if (/^application\/json$/.test(mimeType)) return true;
      return compressible(mimeType) ?? false;
    },
  })
);
server.use(cors());

const router = new Router();

// k8s healthchecks
router.get("/healthz", (ctx) => {
  ctx.status = 200;
});
router.get("/readyz", (ctx) => {
  ctx.status = 200;
});

router.get("/sse/logs", async (ctx) => {
  const opts = typeof ctx.query.input === "string" ? input.parse(JSON.parse(ctx.query.input)) : null;

  ctx.request.socket.setTimeout(0);
  ctx.req.socket.setNoDelay(true);
  ctx.req.socket.setKeepAlive(true);

  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const stream = new PassThrough();

  ctx.status = 200;
  ctx.body = stream;

  let hasEmittedConfig = false;

  await queryLogs(pg, opts ?? {}).forEach((row) => {
    if (!hasEmittedConfig) {
      stream.write("event: config\n");
      stream.write(
        `data: ${JSON.stringify({
          indexerVersion: row.indexerVersion,
          chainId: row.chainId,
          lastUpdatedBlockNumber: row.chainBlockNumber,
        })}\n`
      );
      stream.write("\n");
      hasEmittedConfig = true;
    }

    stream.write("event: log\n");
    stream.write(
      `data: ${JSON.stringify({
        address: row.address,
        eventName: "Store_SetRecord",
        args: {
          tableId: row.tableId,
          keyTuple: decodeDynamicField("bytes32[]", row.keyBytes),
          staticData: row.staticData ?? "0x",
          encodedLengths: row.encodedLengths ?? "0x",
          dynamicData: row.dynamicData ?? "0x",
        },
      } as const satisfies StorageAdapterLog)}\n`
    );
    stream.write("\n");
  });

  // TODO: subscribe + continue writing

  stream.write(":end\n\n");
  stream.end();
});

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
