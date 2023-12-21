#!/usr/bin/env node
import "dotenv/config";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createPublicClient, fallback, webSocket, http, Transport } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { combineLatest, filter, first } from "rxjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createStorageAdapter } from "@latticexyz/store-sync/postgres-decoded";
import { createStoreSync } from "@latticexyz/store-sync";
import { indexerEnvSchema, parseEnv } from "./parseEnv";

const env = parseEnv(
  z.intersection(
    indexerEnvSchema,
    z.object({
      DATABASE_URL: z.string(),
      HEALTHCHECK_HOST: z.string().optional(),
      HEALTHCHECK_PORT: z.coerce.number().optional(),
    })
  )
);

const transports: Transport[] = [
  // prefer WS when specified
  env.RPC_WS_URL ? webSocket(env.RPC_WS_URL) : undefined,
  // otherwise use or fallback to HTTP
  env.RPC_HTTP_URL ? http(env.RPC_HTTP_URL) : undefined,
].filter(isDefined);

const publicClient = createPublicClient({
  transport: fallback(transports),
  pollingInterval: env.POLLING_INTERVAL,
});

const chainId = await publicClient.getChainId();
const database = drizzle(postgres(env.DATABASE_URL, { prepare: false }));

const { storageAdapter, tables } = await createStorageAdapter({ database, publicClient });

let startBlock = env.START_BLOCK;

// Resume from latest block stored in DB. This will throw if the DB doesn't exist yet, so we wrap in a try/catch and ignore the error.
// TODO: query if the DB exists instead of try/catch
try {
  const chainState = await database
    .select()
    .from(tables.configTable)
    .where(eq(tables.configTable.chainId, chainId))
    .limit(1)
    .execute()
    // Get the first record in a way that returns a possible `undefined`
    // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
    .then((rows) => rows.find(() => true));

  if (chainState?.blockNumber != null) {
    startBlock = chainState.blockNumber + 1n;
    console.log("resuming from block number", startBlock);
  }
} catch (error) {
  // ignore errors for now
}

const { latestBlockNumber$, storedBlockLogs$ } = await createStoreSync({
  storageAdapter,
  publicClient,
  startBlock,
  maxBlockRange: env.MAX_BLOCK_RANGE,
  address: env.STORE_ADDRESS,
});

storedBlockLogs$.subscribe();

let isCaughtUp = false;
combineLatest([latestBlockNumber$, storedBlockLogs$])
  .pipe(
    filter(
      ([latestBlockNumber, { blockNumber: lastBlockNumberProcessed }]) => latestBlockNumber === lastBlockNumberProcessed
    ),
    first()
  )
  .subscribe(() => {
    isCaughtUp = true;
    console.log("all caught up");
  });

if (env.HEALTHCHECK_HOST != null || env.HEALTHCHECK_PORT != null) {
  const { default: Koa } = await import("koa");
  const { default: cors } = await import("@koa/cors");
  const { default: Router } = await import("@koa/router");

  const server = new Koa();
  server.use(cors());

  const router = new Router();

  router.get("/", (ctx) => {
    ctx.body = "emit HelloWorld();";
  });

  // k8s healthchecks
  router.get("/healthz", (ctx) => {
    ctx.status = 200;
  });
  router.get("/readyz", (ctx) => {
    if (isCaughtUp) {
      ctx.status = 200;
      ctx.body = "ready";
    } else {
      ctx.status = 424;
      ctx.body = "backfilling";
    }
  });

  server.use(router.routes());
  server.use(router.allowedMethods());

  server.listen({ host: env.HEALTHCHECK_HOST, port: env.HEALTHCHECK_PORT });
  console.log(
    `postgres indexer healthcheck server listening on http://${env.HEALTHCHECK_HOST}:${env.HEALTHCHECK_PORT}`
  );
}
